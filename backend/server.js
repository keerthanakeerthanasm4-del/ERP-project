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
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
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

    const isCodeAuthenticatedHod =
      req.auth.role === "HOD" && req.auth.auth_method === "code";
    let projectLeadId = null;

    if (!isCodeAuthenticatedHod) {
      const userId = Number(req.auth.user_id);
      if (!Number.isSafeInteger(userId) || userId <= 0) {
        return res.status(403).json({
          message: "Your login is not linked to a Project Lead account. Sign in with a registered Project Lead account or create the project as HOD.",
        });
      }

      const projectLead = await prisma.user.findUnique({
        where: { user_id: userId },
        select: { user_id: true, role: true },
      });

      if (!projectLead) {
        return res.status(403).json({
          message: "Your Project Lead account was not found in this database. Ask the HOD to create or assign your account, then sign in again.",
        });
      }

      if (projectLead.role !== "PROJECT_LEAD") {
        return res.status(403).json({
          message: "Your account is not assigned the Project Lead role yet.",
        });
      }

      projectLeadId = projectLead.user_id;
    }

    const project = await prisma.project.create({
      data: {
        project_id: projectId.trim(),
        project_name: name.trim(),
        deadline: parsedDeadline,
        projectLeadId,
      },
    });
    res.status(201).json({ message: "Project created successfully.", project });
  } catch (error) {
    console.error("Create project:", error);
    if (error.code === "P2002") return res.status(409).json({ message: "That project ID is already in use." });
    if (error.code === "P2003") return res.status(400).json({ message: "The selected Project Lead does not exist in this database." });
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

    res.json({
      leads: leads.map((lead) => ({
        id: lead.user_id,
        user_id: lead.user_id,
        name: lead.name,
        email: lead.email,
        department: lead.dept_name || "",
        dept_name: lead.dept_name,
        status: "Active",
      })),
    });

  } catch (error) {
    console.error("Fetch Project Leads Error:", error);

    res.status(500).json({
      message: "Failed to fetch Project Leads",
    });
  }
});

app.post("/api/hod/create-project-lead", requireHod, async (req, res) => {
  try {
    const { name, email, department, temporaryPassword } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedDepartment = typeof department === "string" ? department.trim() : "";

    if (
      !normalizedName ||
      !normalizedEmail ||
      !normalizedDepartment ||
      typeof temporaryPassword !== "string" ||
      temporaryPassword.length < 8
    ) {
      return res.status(400).json({
        message: "Name, email, department, and a temporary password of at least 8 characters are required.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { user_id: true },
    });
    if (existingUser) {
      return res.status(409).json({
        message: "That email already belongs to an account. Use a different email address.",
      });
    }

    const passwordHash = await bcrypt.hash(temporaryPassword, 12);
    const lead = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        dept_name: normalizedDepartment,
        passwordHash,
        role: "PROJECT_LEAD",
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        dept_name: true,
      },
    });

    res.status(201).json({
      message: "Project Lead account created.",
      lead: {
        id: lead.user_id,
        user_id: lead.user_id,
        name: lead.name,
        email: lead.email,
        department: lead.dept_name || "",
        dept_name: lead.dept_name,
        status: "Active",
      },
    });
  } catch (error) {
    console.error("Create Project Lead Error:", error);
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "That email already belongs to an account.",
      });
    }
    res.status(500).json({ message: "Unable to create Project Lead account." });
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
