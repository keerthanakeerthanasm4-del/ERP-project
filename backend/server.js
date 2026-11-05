import "dotenv/config";
import express from "express";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const { PrismaClient } = pkg;
const { Pool } = pg;

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

// Resolve the frontend build directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, "../frontend/dist");

// Backend health-check route
app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Could not fetch users",
    });
  }
});

// Create a user
app.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      error: "Could not create user",
    });
  }
});

// Serve the built frontend
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // React single-page application fallback
  app.get(/.*/, (req, res, next) => {
    if (
      req.path.startsWith("/api/") ||
      req.path === "/users"
    ) {
      return next();
    }

    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  console.warn(
    "Frontend build not found. Run npm run build in the frontend folder."
  );
}

// Start server
app.listen(PORT, () => {
  console.log(`ERP server running at http://localhost:${PORT}`);
});

// Close connections gracefully
process.on("SIGINT", async () => {
  try {
    await prisma.$disconnect();
    await pool.end();
  } finally {
    process.exit(0);
  }
});