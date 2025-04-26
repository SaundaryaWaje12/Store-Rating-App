import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post(
	"/login",
	[
		body("email").isEmail().withMessage("Please enter a valid email"),
		body("password").notEmpty().withMessage("Password is required"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;
		const db = req.app.locals.db;

		try {
			// Get user from database
			const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

			if (users.length === 0) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			const user = users[0];

			// Check password
			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res.status(401).json({ message: "Invalid credentials" });
			}

			// Create JWT payload
			const payload = {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			};

			// Sign token
			const token = jwt.sign(payload, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "24h" });

			// Remove password from user object
			const { password: userPassword, ...userWithoutPassword } = user;

			res.json({
				success: true,
				token,
				user: userWithoutPassword,
			});
		} catch (error) {
			console.error("Login error:", error);
			res.status(500).json({ message: "Server error" });
		}
	}
);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
	"/register",
	[
		body("name").isLength({ min: 8, max: 60 }).withMessage("Name must be between 20 and 60 characters"),
		body("email").isEmail().withMessage("Please enter a valid email"),
		body("password")
			.isLength({ min: 8, max: 16 })
			.withMessage("Password must be between 8 and 16 characters")
			.matches(/[A-Z]/)
			.withMessage("Password must contain at least one uppercase letter")
			.matches(/[!@#$%^&*]/)
			.withMessage("Password must contain at least one special character"),
		body("address").isLength({ max: 400 }).withMessage("Address must not exceed 400 characters"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password, address } = req.body;
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

			// Insert new user
			const [result] = await db.query(
				"INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
				[name, email, hashedPassword, address, "user"]
			);

			const user = {
				id: result.insertId,
				name,
				email,
				address,
				role: "user",
			};

			res.status(201).json(user);
		} catch (error) {
			console.error("Registration error:", error);
			res.status(500).json({ message: "Server error" });
		}
	}
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get("/me", authenticateJWT, async (req, res) => {
	const db = req.app.locals.db;

	try {
		const [users] = await db.query("SELECT id, name, email, address, role FROM users WHERE id = ?", [req.user.id]);

		if (users.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json(users[0]);
	} catch (error) {
		console.error("Get user error:", error);
		res.status(500).json({ message: "Server error" });
	}
});

/**
 * @route   PUT /api/auth/update-password
 * @desc    Update user password
 * @access  Private
 */
router.put(
	"/update-password",
	[
		authenticateJWT,
		body("currentPassword").notEmpty().withMessage("Current password is required"),
		body("newPassword")
			.isLength({ min: 8, max: 16 })
			.withMessage("Password must be between 8 and 16 characters")
			.matches(/[A-Z]/)
			.withMessage("Password must contain at least one uppercase letter")
			.matches(/[!@#$%^&*]/)
			.withMessage("Password must contain at least one special character"),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { currentPassword, newPassword } = req.body;
		const db = req.app.locals.db;

		try {
			// Get user from database with password
			const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);

			if (users.length === 0) {
				return res.status(404).json({ message: "User not found" });
			}

			const user = users[0];

			// Verify current password
			const isMatch = await bcrypt.compare(currentPassword, user.password);

			if (!isMatch) {
				return res.status(400).json({ message: "Current password is incorrect" });
			}

			// Hash new password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(newPassword, salt);

			// Update password
			await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);

			res.json({ message: "Password updated successfully" });
		} catch (error) {
			console.error("Password update error:", error);
			res.status(500).json({ message: "Server error" });
		}
	}
);

/**
 * @route   POST /api/admin/add-user
 * @desc    Add a new user with specified role and other details.
 * @access  Public (Temporarily)  -> Now allows specifying the role.
 */
router.post(
	"/add-user",
	[
		// Removed: authenticateJWT,
		// Removed: // Removed role-based authorization check
		// Validation for the request body
		body("name").notEmpty().trim().withMessage("Username is required"),
		body("email").isEmail().withMessage("Email must be a valid email address"),
		body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
		body("role").notEmpty().trim().withMessage("Role is required"), //  Added role requirement
		// Add validation for any other fields you expect in the request
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password, role } = req.body; //  Get role from request
		const db = req.app.locals.db;

		try {
			// Check if the email is already taken
			const [existingUsers] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
			if (existingUsers.length > 0) {
				return res.status(400).json({ message: "Email is already taken" });
			}

			// Hash the password
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);

			// Insert the new user into the database
			const query = "INSERT INTO users (name, email, password, role";
			const values = [name, email, hashedPassword, role];

			let detailColumns = "";
			let detailValues = "";
			const finalQuery = query + detailColumns + ") VALUES (?, ?, ?, ?" + detailValues + ")";
			const [result] = await db.query(finalQuery, values);

			const newUser = {
				id: result.insertId,
				name,
				email,
				role, // Use the role from the request
			};

			res.status(201).json({ message: "User added successfully", user: newUser });
		} catch (error) {
			console.error("Error adding user:", error);
			res.status(500).json({ message: "Server error" });
		}
	}
);

export default router;
