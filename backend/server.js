import "dotenv/config";
import express from "express";
import cors from "cors";
import os from "node:os";
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
const allowedFrontendOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...Object.values(os.networkInterfaces()).flatMap((interfaces) =>
    (interfaces || [])
      .filter((address) =>
        (address.family === "IPv4" || address.family === 4) &&
        !address.internal
      )
      .map((address) => `http://${address.address}:5173`)
  ),
  ...(process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedFrontendOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "5mb" }));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

// Generate JWT token
async function findUserFromToken(decoded) {
  const rawId = decoded?.user_id ?? decoded?.userId ?? decoded?.id ?? decoded?.sub;
  const userId = Number(rawId);

  if (rawId !== undefined && rawId !== null && Number.isInteger(userId) && userId > 0) {
    return prisma.user.findUnique({ where: { user_id: userId } });
  }

  const email = decoded?.email ?? decoded?.user?.email;
  if (typeof email === "string" && email.trim()) {
    return prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  }

  return null;
}
async function findHodFromToken(decoded) {
  if (decoded?.role === "HOD" && decoded?.auth_method === "code") {
    return { user_id: null, role: "HOD" };
  }

  return findUserFromToken(decoded);
}
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

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Please log in to continue." });
  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
}

function requireHod(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);
    if (req.auth.role !== "HOD" || req.auth.auth_method !== "code") {
      return res.status(403).json({ message: "HOD access only" });
    }
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
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
        role: user.role,
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
      const token = jwt.sign(
        { user_id: null, role: "HOD", auth_method: "code" },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        message: "HOD login successful",
        token,
        user: {
          user_id: null,
          name: "HOD",
          usn: null,
          email: normalizedEmail,
          role: "HOD",
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
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Google login error:", error);

    res.status(500).json({
      message: "Google authentication failed",
    });
  }
});

/* PROJECT LEAD PROFILE */
app.get("/api/project-lead/profile", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { user_id: Number(req.auth.user_id) } });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: { user_id: user.user_id, name: user.name, email: user.email, usn: user.usn, phone: user.ph_no, department: user.dept_name, designation: user.role === "PROJECT_LEAD" ? "Project Lead" : user.role, employee_id: user.usn } });
  } catch (error) {
    console.error("Load project lead profile:", error);
    res.status(500).json({ message: "Unable to load profile." });
  }
});

app.put("/api/project-lead/profile", requireAuth, async (req, res) => {
  try {
    const { name, phone, department } = req.body;
    if (typeof name !== "string" || !name.trim()) return res.status(400).json({ message: "Name is required." });
    const user = await prisma.user.update({ where: { user_id: Number(req.auth.user_id) }, data: { name: name.trim(), ph_no: typeof phone === "string" ? phone.trim() || null : undefined, dept_name: typeof department === "string" ? department.trim() || null : undefined } });
    res.json({ message: "Profile updated.", user: { user_id: user.user_id, name: user.name, email: user.email, usn: user.usn, phone: user.ph_no, department: user.dept_name, designation: user.role === "PROJECT_LEAD" ? "Project Lead" : user.role, employee_id: user.usn } });
  } catch (error) {
    console.error("Update project lead profile:", error);
    res.status(500).json({ message: "Unable to update profile." });
  }
});

/* STUDENT ASSIGNED PROJECTS */
app.get("/api/student/my-projects", requireAuth, async (req, res) => {
  try {
    const userId = Number(req.auth.user_id);
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { projectLeadId: userId },
          { members: { some: { user_id: userId } } },
        ],
      },
      orderBy: { created_at: "desc" },
      select: {
        project_id: true,
        project_name: true,
        description: true,
        status: true,
        deadline: true,
      },
    });

    res.json({ projects });
  } catch (error) {
    console.error("Load assigned student projects:", error);
    res.status(500).json({ message: "Unable to load assigned projects." });
  }
});

/* PROJECT LEAD PROJECTS AND TEAM */
app.get("/api/project-lead/my-projects", requireAuth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { projectLeadId: Number(req.auth.user_id) },
      orderBy: { created_at: "desc" },
      include: { members: { include: { user: { select: { user_id: true, name: true, usn: true, email: true } } } } },
    });
    res.json({ projects: projects.map(({ members, ...project }) => ({
      ...project,
      members: members.map(({ user, role }) => ({ ...user, role })),
    })) });
  } catch (error) {
    console.error("Load project lead projects:", error);
    res.status(500).json({ message: "Unable to load projects." });
  }
});

app.post("/api/project-lead/projects", requireAuth, async (req, res) => {
  try {
    const { name, projectId, deadline } = req.body;
    if (!name?.trim() || !projectId?.trim() || !deadline) return res.status(400).json({ message: "Project name, ID, and deadline are required." });
    const parsedDeadline = new Date(`${deadline}T00:00:00.000Z`);
    if (Number.isNaN(parsedDeadline.getTime())) return res.status(400).json({ message: "Enter a valid deadline." });
    const project = await prisma.project.create({
      data: { project_id: projectId.trim(), project_name: name.trim(), deadline: parsedDeadline, projectLeadId: Number(req.auth.user_id) },
    });
    res.status(201).json({ message: "Project created successfully.", project });
  } catch (error) {
    console.error("Create project:", error);
    if (error.code === "P2002") return res.status(409).json({ message: "That project ID is already in use." });
    res.status(500).json({ message: "Unable to create project." });
  }
});

app.get("/api/project-lead/projects/:projectId", requireAuth, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: { project_id: req.params.projectId, projectLeadId: Number(req.auth.user_id) },
      include: { members: { orderBy: { added_at: "asc" }, include: { user: { select: { user_id: true, name: true, usn: true, email: true } } } } },
    });
    if (!project) return res.status(404).json({ message: "Project not found." });
    res.json({ project: { ...project, members: project.members.map(({ user, role }) => ({ ...user, role })) } });
  } catch (error) {
    console.error("Load project details:", error);
    res.status(500).json({ message: "Unable to load project details." });
  }
});

app.post("/api/project-lead/projects/:projectId/members", requireAuth, async (req, res) => {
  try {
    const { usn, email, role } = req.body;
    const normalizedUsn = typeof usn === "string" ? usn.trim().toUpperCase() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const allowedRoles = ["TEAM_LEAD", "TECH_LEAD", "TEAM_MEMBER"];
    if (!normalizedUsn || !normalizedEmail || !allowedRoles.includes(role)) return res.status(400).json({ message: "Enter a USN, email, and valid role." });
    const project = await prisma.project.findFirst({ where: { project_id: req.params.projectId, projectLeadId: Number(req.auth.user_id) }, select: { project_id: true } });
    if (!project) return res.status(404).json({ message: "Project not found." });
    const user = await prisma.user.findFirst({ where: { usn: normalizedUsn, email: normalizedEmail }, select: { user_id: true, name: true, usn: true, email: true } });
    if (!user) return res.status(404).json({ message: "No registered user matches both that USN and email." });
    const membership = await prisma.projectMember.create({ data: { project_id: project.project_id, user_id: user.user_id, role } });
    res.status(201).json({ message: "User added to project.", member: { ...user, role: membership.role } });
  } catch (error) {
    console.error("Add project member:", error);
    if (error.code === "P2002") return res.status(409).json({ message: "This user is already assigned to the project." });
    res.status(500).json({ message: "Unable to add user to the project." });
  }
});

// GET ALL PROJECTS - HOD ONLY
app.get("/api/hod/projects", requireHod, async (req, res) => {
  try {
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
app.get("/api/hod/project-leads", requireHod, async (req, res) => {
  try {

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
// GET CURRENT DEPARTMENT PROJECT LEAD ASSIGNMENT - HOD ONLY
app.get("/api/hod/department-assignment", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await findHodFromToken(decoded);

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const assignment = await prisma.departmentProjectLeadAssignment.findUnique({
      where: { id: 1 },
      include: {
        assignedUser: {
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
      assignment: assignment?.assignedUser || null,
    });

  } catch (error) {
    console.error("Fetch Department Assignment Error:", error);

    res.status(500).json({
      message: "Failed to fetch department assignment",
    });
  }
});
// GET DEPARTMENT PROJECT LEAD ASSIGNMENT HISTORY - HOD ONLY
app.get("/api/hod/department-assignment-history", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await findHodFromToken(decoded);

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const history = await prisma.projectLeadAssignmentHistory.findMany({
      orderBy: {
        assignedAt: "desc",
      },
    });

    res.json(history);

  } catch (error) {
    console.error("Project Lead History Error:", error);

    res.status(500).json({
      message: "Failed to fetch Project Lead assignment history",
    });
  }
});
// ASSIGN / CHANGE DEPARTMENT PROJECT LEAD - HOD ONLY
app.put("/api/hod/department-assignment", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await findHodFromToken(decoded);

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const { studentId, email, password } = req.body;

    if (!studentId || !email || !password) {
      return res.status(400).json({
        message: "Project Lead ID, email and password are required",
      });
    }

    const student = await prisma.user.findUnique({
      where: {
        user_id: Number(studentId),
      },
    });

    if (!student || student.role !== "PROJECT_LEAD") {
      return res.status(404).json({
        message: "Project Lead account not found",
      });
    }

    if (student.email.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(401).json({
        message: "Email does not match the selected Project Lead account",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      student.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Incorrect student password",
      });
    }

    const result = await prisma.$transaction(async (tx) => {

  // Check current department assignment
  const currentAssignment =
    await tx.departmentProjectLeadAssignment.findUnique({
      where: { id: 1 },
    });

  // Avoid duplicate history if the same student is assigned again
  if (currentAssignment?.assignedUserId === student.user_id) {
    const existingAssignment =
      await tx.departmentProjectLeadAssignment.findUnique({
        where: { id: 1 },
        include: {
          assignedUser: {
            select: {
              user_id: true,
              name: true,
              email: true,
              dept_name: true,
            },
          },
        },
      });

    return {
      assignment: existingAssignment,
      unchanged: true,
    };
  }

  // Close the previous student's active history record
  if (currentAssignment?.assignedUserId) {
    await tx.projectLeadAssignmentHistory.updateMany({
      where: {
        assignedUserId: currentAssignment.assignedUserId,
        relievedAt: null,
      },
      data: {
        relievedAt: new Date(),
      },
    });
  }

  // Create history for the newly assigned student
  await tx.projectLeadAssignmentHistory.create({
    data: {
      assignedUserId: student.user_id,
      assignedName: student.name,
      assignedEmail: student.email,
      department: student.dept_name,
    },
  });

  // Update current department assignment
  const assignment =
    await tx.departmentProjectLeadAssignment.upsert({
      where: { id: 1 },

      update: {
        assignedUserId: student.user_id,
      },

      create: {
        id: 1,
        assignedUserId: student.user_id,
      },

      include: {
        assignedUser: {
          select: {
            user_id: true,
            name: true,
            email: true,
            dept_name: true,
          },
        },
      },
    });

  return {
    assignment,
    unchanged: false,
  };
});

res.json({
  message: result.unchanged
    ? "This student is already assigned as Project Lead"
    : "Department Project Lead assigned successfully",

  assignment: result.assignment?.assignedUser || null,
});
  } catch (error) {
    console.error("Department Project Lead Assignment Error:", error);

    res.status(500).json({
      message: "Failed to assign Department Project Lead",
    });
  }
});
// REMOVE DEPARTMENT PROJECT LEAD ASSIGNMENT - HOD ONLY
app.delete("/api/hod/department-assignment", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await findHodFromToken(decoded);

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const assignment = await prisma.departmentProjectLeadAssignment.findUnique({
      where: { id: 1 },
    });

    if (!assignment || assignment.assignedUserId === null) {
      return res.status(404).json({
        message: "No Project Lead is currently assigned",
      });
    }

    await prisma.$transaction(async (tx) => {

  // Close the current Project Lead's history record
  await tx.projectLeadAssignmentHistory.updateMany({
    where: {
      assignedUserId: assignment.assignedUserId,
      relievedAt: null,
    },
    data: {
      relievedAt: new Date(),
    },
  });

  // Remove the current department assignment
  await tx.departmentProjectLeadAssignment.update({
    where: { id: 1 },
    data: {
      assignedUserId: null,
    },
  });

});
    res.json({
      message: "Department Project Lead assignment removed successfully",
    });

  } catch (error) {
    console.error("Remove Department Project Lead Error:", error);

    res.status(500).json({
      message: "Failed to remove department assignment",
    });
  }
});
// CREATE PERMANENT PROJECT LEAD ACCOUNT - HOD ONLY
app.post("/api/hod/create-project-lead", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await findHodFromToken(decoded);

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        message: "Name, email and department are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDepartment = department.trim();

    // Check whether the permanent account already exists
    const existingProjectLead = await prisma.user.findFirst({
      where: {
        role: "PROJECT_LEAD",
      },
    });

    if (existingProjectLead) {
      return res.status(409).json({
        message: "Permanent Project Lead account already exists",
      });
    }

    // Check whether email is already registered
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    // Generate temporary password
    const temporaryPassword = typeof req.body.temporaryPassword === "string" ? req.body.temporaryPassword : "";

    if (temporaryPassword.length < 8) {
      return res.status(400).json({ message: "Temporary password must be at least 8 characters" });
    }

    const passwordHash = await bcrypt.hash(
      temporaryPassword,
      10
    );

    // Create permanent Project Lead account
    const projectLead = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        dept_name: normalizedDepartment,
        usn: null,
        passwordHash,
        role: "PROJECT_LEAD",
      },
    });

    res.status(201).json({
      message: "Permanent Project Lead account created successfully",
      temporaryPassword,
      projectLead: {
        user_id: projectLead.user_id,
        name: projectLead.name,
        email: projectLead.email,
        dept_name: projectLead.dept_name,
        role: projectLead.role,
      },
    });

  } catch (error) {
    console.error("Create Permanent Project Lead Error:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    res.status(500).json({
      message: "Failed to create permanent Project Lead account",
    });
  }
});

// HOD meeting schedule
app.get("/api/hod/meetings", requireHod, async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      include: { project: { select: { project_id: true, project_name: true } } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    res.json({ meetings });
  } catch (error) {
    console.error("Fetch HOD meetings:", error);
    res.status(500).json({ message: "Failed to fetch meetings." });
  }
});


app.post("/api/hod/meetings", requireHod, async (req, res) => {
  try {
    const { title, project, project_id, date, startTime, endTime, venue } = req.body;
    if (![title, project, date, startTime, endTime, venue].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ message: "Complete all meeting fields." });
    }
    const meetingDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(meetingDate.getTime()) || endTime <= startTime) {
      return res.status(400).json({ message: "Enter a valid date and time range." });
    }
    if (project_id) {
      const linkedProject = await prisma.project.findUnique({ where: { project_id } });
      if (!linkedProject) return res.status(400).json({ message: "Selected project was not found." });
    }
    const meeting = await prisma.meeting.create({
      data: {
        title: title.trim(), projectName: project.trim(), date: meetingDate,
        startTime, endTime, venue: venue.trim(), project_id: project_id || null,
      },
    });
    res.status(201).json({ message: "Meeting scheduled.", meeting });
  } catch (error) {
    console.error("Create HOD meeting:", error);
    res.status(500).json({ message: "Failed to schedule meeting." });
  }
});

app.patch("/api/hod/meetings/:meetingId/status", requireHod, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid meeting status." });
    }
    const meetingId = Number(req.params.meetingId);
    if (!Number.isInteger(meetingId)) return res.status(400).json({ message: "Invalid meeting ID." });
    const meeting = await prisma.meeting.update({ where: { meeting_id: meetingId }, data: { status } });
    res.json({ message: "Meeting status updated.", meeting });
  } catch (error) {
    console.error("Update HOD meeting status:", error);
    if (error.code === "P2025") return res.status(404).json({ message: "Meeting not found." });
    res.status(500).json({ message: "Failed to update meeting status." });
  }
});
// ASSIGN / CHANGE / REMOVE PROJECT LEAD - HOD ONLY
app.patch("/api/hod/projects/:projectId/lead", requireHod, async (req, res) => {
  try {
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
// GET HOD PROFILE - HOD ONLY
app.get("/api/hod/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await findHodFromToken(decoded);

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    let profile = await prisma.hODProfile.findUnique({
      where: {
        id: 1,
      },
    });

    // Create default profile if it does not exist
    if (!profile) {
      profile = await prisma.hODProfile.create({
        data: {
          id: 1,
        },
      });
    }

    res.json({
      profile,
    });

  } catch (error) {
    console.error("Fetch HOD Profile Error:", error);

    res.status(500).json({
      message: "Failed to fetch HOD profile",
    });
  }
});
// UPDATE HOD PROFILE - HOD ONLY
app.put("/api/hod/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await findHodFromToken(decoded);

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const {
      name,
      designation,
      employeeId,
      joiningDate,
      email,
      phone,
      department,
      institution,
      location,
    } = req.body;

    if (
      !name?.trim() ||
      !designation?.trim() ||
      !employeeId?.trim() ||
      !joiningDate ||
      !email?.trim() ||
      !phone?.trim() ||
      !department?.trim() ||
      !institution?.trim() ||
      !location?.trim()
    ) {
      return res.status(400).json({
        message: "All profile fields are required",
      });
    }

    const profile = await prisma.hODProfile.upsert({
      where: {
        id: 1,
      },

      update: {
        name: name.trim(),
        designation: designation.trim(),
        employeeId: employeeId.trim(),
        joiningDate: new Date(joiningDate),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        institution: institution.trim(),
        location: location.trim(),
      },

      create: {
        id: 1,
        name: name.trim(),
        designation: designation.trim(),
        employeeId: employeeId.trim(),
        joiningDate: new Date(joiningDate),
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        institution: institution.trim(),
        location: location.trim(),
      },
    });

    res.json({
      message: "HOD profile updated successfully",
      profile,
    });

  } catch (error) {
    console.error("Update HOD Profile Error:", error);

    res.status(500).json({
      message: "Failed to update HOD profile",
    });
  }
});
// UPDATE HOD PROFILE IMAGE - HOD ONLY
app.patch("/api/hod/profile/image", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const hod = await findHodFromToken(decoded);

    if (!hod || hod.role !== "HOD") {
      return res.status(403).json({
        message: "HOD access only",
      });
    }

    const { profileImage } = req.body;

    if (
      profileImage !== null &&
      (typeof profileImage !== "string" ||
        !profileImage.startsWith("data:image/"))
    ) {
      return res.status(400).json({
        message: "Invalid profile image",
      });
    }

    const profile = await prisma.hODProfile.upsert({
      where: {
        id: 1,
      },

      update: {
        profileImage,
      },

      create: {
        id: 1,
        profileImage,
      },
    });

    res.json({
      message: "Profile image updated successfully",
      profileImage: profile.profileImage,
    });

  } catch (error) {
    console.error("Update HOD Profile Image Error:", error);

    res.status(500).json({
      message: "Failed to update profile image",
    });
  }
});
/* -------------------------------------------------------
   START SERVER
------------------------------------------------------- */

app.listen(PORT, "0.0.0.0", () => {
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
