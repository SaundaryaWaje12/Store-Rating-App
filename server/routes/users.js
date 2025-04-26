import express from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import { isAdmin, isAdminOrSelf } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get("/", isAdmin, async (req, res) => {
	const db = req.app.locals.db;
	const limit = req.query.limit ? parseInt(req.query.limit) : null;

	try {
		let query = "SELECT id, name, email, address, role, created_at as createdAt FROM users";
		let params = [];

		if (limit) {
			query += " LIMIT ?";
			params.push(limit);
		}

		const [users] = await db.query(query, params);

		// For store owners, fetch their rating
		const storeOwners = users.filter((user) => user.role === "store_owner");

		if (storeOwners.length > 0) {
			const storeOwnerIds = storeOwners.map((owner) => owner.id);
			const placeholders = storeOwnerIds.map(() => "?").join(",");

			const [stores] = await db.query(
				`SELECT s.user_id, AVG(rating) as avgRating
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.user_id IN (${placeholders})
         GROUP BY s.id`,
				storeOwnerIds
			);

			// Map store ratings to users
			const storeRatings = {};
			stores.forEach((store) => {
				storeRatings[store.user_id] = store.avgRating;
			});

			// Add ratings to store owners
			users.forEach((user) => {
				if (user.role === "store_owner") {
					user.rating = storeRatings[user.id] || null;
				}
			});
		}

		res.json(users);
	} catch (error) {
		console.error("Get users error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or Self)
 */
router.get("/:id", isAdminOrSelf, async (req, res) => {
	const db = req.app.locals.db;

	try {
		const [users] = await db.query(
			"SELECT id, name, email, address, role, created_at as createdAt FROM users WHERE id = ?",
			[req.params.id]
		);

		if (users.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		const user = users[0];

		// If store owner, get store rating
		if (user.role === "store_owner") {
			const [stores] = await db.query(
				`SELECT AVG(r.rating) as avgRating 
         FROM stores s
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE s.user_id = ?
         GROUP BY s.id`,
				[user.id]
			);

			if (stores.length > 0) {
				user.rating = stores[0].avgRating;
			} else {
				user.rating = null;
			}
		}

		res.json(user);
	} catch (error) {
		console.error("Get user error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post(
	"/",
	[
		isAdmin,
		body("name").isLength({ min: 20, max: 60 }).withMessage("Name must be between 20 and 60 characters"),
		body("email").isEmail().withMessage("Please enter a valid email"),
		body("password")
			.isLength({ min: 8, max: 16 })
			.withMessage("Password must be between 8 and 16 characters")
			.matches(/[A-Z]/)
			.withMessage("Password must contain at least one uppercase letter")
			.matches(/[!@#$%^&*]/)
			.withMessage("Password must contain at least one special character"),
		body("address").isLength({ max: 400 }).withMessage("Address must not exceed 400 characters"),
		body("role").isIn(["user", "admin", "store_owner"]).withMessage("Invalid role"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password, address, role } = req.body;
		const db = req.app.locals.db;

		try {
			// Check if user already exists
			const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

			if (existingUsers.length > 0) {
				return res.status(400).json({ message: "User already exists" });
			}

			// Hash password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			// Create user
			const [result] = await db.query(
				"INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
				[name, email, hashedPassword, address, role]
			);

			// If creating a store owner, also create a store
			if (role === "store_owner") {
				await db.query("INSERT INTO stores (name, email, address, user_id) VALUES (?, ?, ?, ?)", [
					name,
					email,
					address,
					result.insertId,
				]);
			}

			const user = {
				id: result.insertId,
				name,
				email,
				address,
				role,
				createdAt: new Date(),
			};

			res.status(201).json(user);
		} catch (error) {
			console.error("Create user error:", error);
			res.status(500).json({ message: "Server error" });
		}
	}
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin or Self)
 */
router.put(
	"/:id",
	[
		isAdminOrSelf,
		body("name").optional().isLength({ min: 20, max: 60 }).withMessage("Name must be between 20 and 60 characters"),
		body("email").optional().isEmail().withMessage("Please enter a valid email"),
		body("address").optional().isLength({ max: 400 }).withMessage("Address must not exceed 400 characters"),
		body("role").optional().isIn(["user", "admin", "store_owner"]).withMessage("Invalid role"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, address, role } = req.body;
		const userId = req.params.id;
		const db = req.app.locals.db;

		try {
			// Check if user exists
			const [existingUsers] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

			if (existingUsers.length === 0) {
				return res.status(404).json({ message: "User not found" });
			}

			const user = existingUsers[0];
			const oldRole = user.role;

			// Build update query
			let updateQuery = "UPDATE users SET";
			const updateFields = [];
			const updateValues = [];

			if (name !== undefined) {
				updateFields.push(" name = ?");
				updateValues.push(name);
			}

			if (email !== undefined) {
				// Check if email is already in use by another user
				const [emailCheck] = await db.query("SELECT * FROM users WHERE email = ? AND id != ?", [email, userId]);

				if (emailCheck.length > 0) {
					return res.status(400).json({ message: "Email already in use" });
				}

				updateFields.push(" email = ?");
				updateValues.push(email);
			}

			if (address !== undefined) {
				updateFields.push(" address = ?");
				updateValues.push(address);
			}

			// Only admins can change roles
			if (role !== undefined && req.user.role === "admin") {
				updateFields.push(" role = ?");
				updateValues.push(role);
			}

			// If no fields to update
			if (updateFields.length === 0) {
				return res.status(400).json({ message: "No valid fields to update" });
			}

			// Complete query
			updateQuery += updateFields.join(",");
			updateQuery += " WHERE id = ?";
			updateValues.push(userId);

			// Update user
			await db.query(updateQuery, updateValues);

			// Handle role change
			if (req.user.role === "admin" && role !== undefined && oldRole !== role) {
				// If changing to store owner, create a store
				if (role === "store_owner") {
					const storeName = name || user.name;
					const storeEmail = email || user.email;
					const storeAddress = address || user.address;

					await db.query("INSERT INTO stores (name, email, address, user_id) VALUES (?, ?, ?, ?)", [
						storeName,
						storeEmail,
						storeAddress,
						userId,
					]);
				}

				// If changing from store owner, handle store (optional)
				if (oldRole === "store_owner") {
					// Option 1: Delete store (comment out if not wanted)
					// await db.query('DELETE FROM stores WHERE user_id = ?', [userId]);

					// Option 2: Keep store but mark as inactive/unassigned
					await db.query("UPDATE stores SET active = 0 WHERE user_id = ?", [userId]);
				}
			}

			// Get updated user
			const [updatedUsers] = await db.query(
				"SELECT id, name, email, address, role, created_at as createdAt FROM users WHERE id = ?",
				[userId]
			);

			res.json(updatedUsers[0]);
		} catch (error) {
			console.error("Update user error:", error);
			res.status(500).json({ message: "Server error" });
		}
	}
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete("/:id", isAdmin, async (req, res) => {
	const userId = req.params.id;
	const db = req.app.locals.db;

	try {
		// Check if user exists
		const [existingUsers] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

		if (existingUsers.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		const user = existingUsers[0];

		// If store owner, handle stores
		if (user.role === "store_owner") {
			// Get store id
			const [stores] = await db.query("SELECT id FROM stores WHERE user_id = ?", [userId]);

			if (stores.length > 0) {
				const storeId = stores[0].id;

				// Delete ratings for this store
				await db.query("DELETE FROM ratings WHERE store_id = ?", [storeId]);

				// Delete store
				await db.query("DELETE FROM stores WHERE id = ?", [storeId]);
			}
		}

		// Delete user's ratings
		await db.query("DELETE FROM ratings WHERE user_id = ?", [userId]);

		// Delete user
		await db.query("DELETE FROM users WHERE id = ?", [userId]);

		res.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Delete user error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

export default router;
