import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const app = express();
const PORT = 5000;

// Environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;

// Check JWT_SECRET
if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is missing in backend/.env");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

/* -------------------------------------------------------
   1. HEALTH CHECK
------------------------------------------------------- */

app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

/* -------------------------------------------------------
   2. DATABASE TEST
------------------------------------------------------- */

app.get("/api/test-db", async (req, res) => {
  try {
    await prisma.$connect();

    await prisma.$queryRaw`SELECT 1`;

    res.json({
      message: "Database connected successfully",
    });

  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

/* -------------------------------------------------------
   3. REGISTER NEW USER
------------------------------------------------------- */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, usn, email, password } = req.body;

    // Check required fields
    if (!name || !usn || !email || !password) {
      return res.status(400).json({
        message: "Name, USN, email and password are required",
      });
    }

    // Normalize input
    const normalizedName = name.trim();
    const normalizedUSN = usn.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters",
      });
    }

    // Check whether email already exists
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already registered. Please login.",
      });
    }

    // Check whether USN already exists
    const existingUSN = await prisma.user.findUnique({
      where: {
        usn: normalizedUSN,
      },
    });

    if (existingUSN) {
      return res.status(409).json({
        message: "This USN is already registered.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name: normalizedName,
        usn: normalizedUSN,
        email: normalizedEmail,
        passwordHash,
      },
    });

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,

      user: {
        user_id: user.user_id,
        name: user.name,
        usn: user.usn,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Registration error:", error);

    // Handle duplicate database values
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Email or USN already registered.",
      });
    }

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

/* -------------------------------------------------------
   4. EMAIL AND PASSWORD LOGIN
------------------------------------------------------- */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Enter email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,

      user: {
        user_id: user.user_id,
        name: user.name,
        usn: user.usn,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

/* -------------------------------------------------------
   5. GOOGLE LOGIN - ACCOUNT SELECTION
------------------------------------------------------- */

app.post("/api/auth/google", async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        message: "Google access token is required",
      });
    }

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        message: "Google Client ID is not configured",
      });
    }

    // STEP 1: Verify Google's access token
    const tokenResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
    );

    if (!tokenResponse.ok) {
      return res.status(401).json({
        message: "Invalid or expired Google token",
      });
    }

    const tokenInfo = await tokenResponse.json();

    // Verify token audience
    const tokenAudience =
      tokenInfo.aud || tokenInfo.audience || tokenInfo.issued_to;

    if (
      tokenAudience !== GOOGLE_CLIENT_ID ||
      Number(tokenInfo.expires_in) <= 0
    ) {
      return res.status(401).json({
        message: "Google token verification failed",
      });
    }

    // STEP 2: Get selected Google account information
    const userResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      return res.status(401).json({
        message: "Unable to retrieve Google account details",
      });
    }

    const googleUser = await userResponse.json();

    // Verify Google email
    if (
      !googleUser.email ||
      googleUser.email_verified !== true ||
      !googleUser.sub
    ) {
      return res.status(401).json({
        message: "Google email verification failed",
      });
    }

    // Ensure token and user information identify the same account
    if (
      tokenInfo.sub &&
      tokenInfo.sub !== googleUser.sub
    ) {
      return res.status(401).json({
        message: "Google account verification failed",
      });
    }

    const email = googleUser.email.trim().toLowerCase();

    const name =
      googleUser.name || email.split("@")[0];

    // STEP 3: Check whether user already exists
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // STEP 4: Automatically create new Google user
    if (!user) {
      const randomPassword = crypto
        .randomBytes(32)
        .toString("hex");

      const passwordHash = await bcrypt.hash(
        randomPassword,
        10
      );

      user = await prisma.user.create({
        data: {
          name,
          email,
          usn: null,
          passwordHash,
        },
      });
    }

    // STEP 5: Generate application JWT
    const token = generateToken(user);

    // STEP 6: Send response to frontend
    res.json({
      message: "Google login successful",
      token,

      user: {
        user_id: user.user_id,
        name: user.name,
        usn: user.usn,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Google login error:", error);

    res.status(500).json({
      message: "Google authentication failed",
    });
  }
});

/* -------------------------------------------------------
   START SERVER
------------------------------------------------------- */

app.listen(PORT, () => {
  console.log(
    `Backend running at http://localhost:${PORT}`
  );
});

/* -------------------------------------------------------
   CLOSE DATABASE CONNECTIONS
------------------------------------------------------- */

process.on("SIGINT", async () => {
  await prisma.$disconnect();

  await pool.end();

  process.exit(0);
});