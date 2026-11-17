import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { PrismaClient } from "./generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

const app = express();
const PORT = 5000;

// Development HOD credentials requested for the login page.
const HOD_LOGIN_EMAIL = "hodsvce@gmail.com";
const HOD_LOGIN_PASSWORD = "hodsvce@123";

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

    // --------------------------------
    // 1. HARDCODED HOD LOGIN
    // --------------------------------

    if (
      normalizedEmail === HOD_LOGIN_EMAIL &&
      password === HOD_LOGIN_PASSWORD
    ) {
      const hod = await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (!hod || hod.role !== "HOD") {
        return res.status(403).json({
          message: "HOD account not found or role is incorrect",
        });
      }

      const token = generateToken(hod);

      return res.json({
        message: "HOD login successful",
        token,
        user: {
          user_id: hod.user_id,
          name: hod.name,
          usn: hod.usn,
          email: hod.email,
          role: hod.role,
        },
      });
    }

    // --------------------------------
    // 2. NORMAL STUDENT / USER LOGIN
    // --------------------------------

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

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        usn: user.usn,
        email: user.email,
        role: user.role,
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
// GET ALL PROJECTS - HOD ONLY
app.get("/api/hod/projects", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await prisma.user.findUnique({
      where: { user_id: decoded.user_id },
    });

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const projects = await prisma.project.findMany({
  include: {
    projectLead: {
      select: {
        user_id: true,
        name: true,
        email: true,
        dept_name: true,
      },
    },
    phases: {
      orderBy: {
        phase_order: "asc",
      },
    },
  },
  orderBy: {
    project_name: "asc",
  },
});

    res.json({ projects });

  } catch (error) {
    console.error("Fetch HOD Projects Error:", error);

    res.status(500).json({
      message: "Failed to fetch projects",
    });
  }
});
app.get("/api/hod/project-leads", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await prisma.user.findUnique({
      where: { user_id: decoded.user_id },
    });

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const leads = await prisma.user.findMany({
      where: {
        role: "PROJECT_LEAD",
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        dept_name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({ leads });

  } catch (error) {
    console.error("Fetch Project Leads Error:", error);

    res.status(500).json({
      message: "Failed to fetch Project Leads",
    });
  }
});
// ASSIGN / CHANGE / REMOVE PROJECT LEAD - HOD ONLY
app.patch("/api/hod/projects/:projectId/lead", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await prisma.user.findUnique({
      where: { user_id: decoded.user_id },
    });

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const { leadId } = req.body;
    const projectId = req.params.projectId;

    const project = await prisma.project.findUnique({
      where: { project_id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    let assignedLeadId = null;

    if (leadId !== null) {
      assignedLeadId = Number(leadId);

      if (!Number.isInteger(assignedLeadId)) {
        return res.status(400).json({
          message: "Invalid Project Lead ID",
        });
      }

      const lead = await prisma.user.findUnique({
        where: { user_id: assignedLeadId },
      });

      if (!lead || lead.role !== "PROJECT_LEAD") {
        return res.status(404).json({
          message: "Project Lead not found",
        });
      }
    }

    const updatedProject = await prisma.project.update({
      where: { project_id: projectId },
      data: {
        projectLeadId: assignedLeadId,
      },
      include: {
        projectLead: {
          select: {
            user_id: true,
            name: true,
            email: true,
            dept_name: true,
          },
        },
      },
    });

    res.json({
      message: "Project Lead assignment updated successfully",
      project: updatedProject,
    });

  } catch (error) {
    console.error("Project Lead Assignment Error:", error);

    res.status(500).json({
      message: "Failed to update Project Lead assignment",
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
