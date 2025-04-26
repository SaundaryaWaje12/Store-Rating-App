import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import mysql from "mysql2/promise";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import storeRoutes from "./routes/stores.js";
import ratingRoutes from "./routes/ratings.js";
import dashboardRoutes from "./routes/dashboard.js";

// Middleware
import { authenticateJWT } from "./middleware/auth.js";

// Init
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Calculate dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection pool
const db = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "Harshal@123",
	database: process.env.DB_NAME || "store_rating_system",
	waitForConnections: true,
	connectionLimit: 10,
});

// Make db available to routes
app.locals.db = db;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateJWT, userRoutes);
app.use("/api/stores", authenticateJWT, storeRoutes);
app.use("/api/ratings", authenticateJWT, ratingRoutes);
app.use("/api/dashboard", authenticateJWT, dashboardRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../dist", "index.html"));
	});
}

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export default app;
