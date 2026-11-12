import { useState, useEffect, useRef } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import "./App.css";
import Dashboard from "./Dashboard";

/* -------------------------------------------------------
   API CONFIGURATION
------------------------------------------------------- */

const API_URL = "http://localhost:5000";

const GOOGLE_CLIENT_ID =
  "935746879596-3bi48aq1oqekpld9segrobopoph05pvk.apps.googleusercontent.com";

/* -------------------------------------------------------
   SHARED ICONS AND BRAND
------------------------------------------------------- */

function CapIcon() {
  return (
    <svg viewBox="0 0 40 34" className="cap-icon" aria-hidden="true">
      <path d="M2 11 20 2 38 11 20 20 2 11Z" />
      <path d="M8 15v8c7 6 17 6 24 0v-8" />
      <path d="M36 12v12" />
      <circle cx="36" cy="27" r="2" />
    </svg>
  );
}

function Brand({ label = "Campus Project Tracker" }) {
  return (
    <Link to="/" className="brand">
      <CapIcon />
      <span>{label}</span>
    </Link>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="field-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="field-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="12" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

/* -------------------------------------------------------
   SHARED LOGIN STORAGE
------------------------------------------------------- */

function saveLogin(data, rememberMe, navigate) {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");

  if (rememberMe) {
    localStorage.setItem("token", data.token);
  } else {
    sessionStorage.setItem("token", data.token);
  }

  localStorage.setItem("user", JSON.stringify(data.user));

  navigate("/dashboard");
}

/* -------------------------------------------------------
   PAGE 1: HOME PAGE
------------------------------------------------------- */

function HomePage() {
  return (
    <main className="home-page">
      <div className="home-shade" aria-hidden="true" />

      <header className="site-header home-header">
        <Brand />
      </header>

      <div className="home-note home-note-left" aria-hidden="true">
        <span>Your Ideas</span>
        <span>Our Campus</span>
        <span>Better Tomorrow</span>
        <i />
      </div>

      <div className="home-note home-note-right" aria-hidden="true">
        <span>Track</span>
        <span>Manage</span>
        <span>Complete</span>
        <i />
      </div>

      <div className="hero-doodle hero-doodle-plane" aria-hidden="true">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        >
          <path d="M8 47 88 10 61 91 45 59 8 47Z" />
          <path d="m45 59 43-49" />
        </svg>
      </div>

      <div className="flight-trail" aria-hidden="true" />

      <section className="home-hero" aria-label="Campus Project Tracker">
        <p className="hero-kicker">
          Plan <span>·</span> Build <span>·</span> Succeed
        </p>

        <h1 className="hero-title">
          <span className="title-campus">CAMPUS</span>

          <span className="title-project">
            <span>PROJECT</span> <span>TRACKER</span>
          </span>
        </h1>

        <div className="hero-brush" aria-hidden="true" />
      </section>

      <Link to="/login" className="get-started-button">
        <span>Get Started</span>
        <ArrowIcon />
      </Link>

      <div className="home-waves" aria-hidden="true">
        <span className="wave wave-left" />
        <span className="wave wave-right" />
      </div>
    </main>
  );
}

/* -------------------------------------------------------
   PAGE 2: LOGIN PAGE
------------------------------------------------------- */

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  const googleTokenClient = useRef(null);

  // Load Google Identity Services and prepare account selection.
  useEffect(() => {
    let script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    let createdScript = false;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.oauth2) {
        setMessage(
          "Google sign-in could not be initialized. Please refresh the page."
        );
        return;
      }

      googleTokenClient.current =
        window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,

          scope: "openid email profile",

          callback: async (googleResponse) => {
            if (
              googleResponse.error ||
              !googleResponse.access_token
            ) {
              setMessage(
                "Google sign-in was cancelled or could not be completed."
              );
              return;
            }

            setMessage("");
            setIsLoggingIn(true);

            try {
              const response = await fetch(
                `${API_URL}/api/auth/google`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    accessToken: googleResponse.access_token,
                  }),
                }
              );

              const data = await response.json();

              if (!response.ok) {
                setMessage(
                  data.message || "Google login failed."
                );
                return;
              }

              saveLogin(data, rememberMe, navigate);

            } catch (error) {
              console.error("Google login error:", error);

              setMessage(
                "Unable to connect to the backend."
              );

            } finally {
              setIsLoggingIn(false);
            }
          },

          error_callback: (error) => {
            console.error("Google popup error:", error);

            setMessage(
              "Google account selection was cancelled or blocked."
            );
          },
        });
    };

    if (window.google?.accounts?.oauth2) {
      initializeGoogle();
      return;
    }

    if (!script) {
      script = document.createElement("script");

      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      createdScript = true;
    }

    const handleScriptLoad = () => initializeGoogle();

    const handleScriptError = () => {
      setMessage(
        "Google sign-in could not be loaded. Please refresh the page."
      );
    };

    script.addEventListener("load", handleScriptLoad);
    script.addEventListener("error", handleScriptError);

    if (createdScript) {
      document.head.appendChild(script);
    }

    return () => {
      script?.removeEventListener("load", handleScriptLoad);
      script?.removeEventListener("error", handleScriptError);
    };

  }, [rememberMe, navigate]);

  // Email and password login.
  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");
    setIsLoggingIn(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Invalid email or password"
        );
        return;
      }

      saveLogin(data, rememberMe, navigate);

    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        "Unable to connect to the backend."
      );

    } finally {
      setIsLoggingIn(false);
    }
  }

  // Open Google's account chooser.
  function handleGoogleLogin() {
    setMessage("");

    if (!googleTokenClient.current) {
      setMessage(
        "Google sign-in is loading. Please try again in a moment."
      );
      return;
    }

    googleTokenClient.current.requestAccessToken({
      prompt: "select_account",
    });
  }

  return (
    <main className="login-page">
      <div className="page-overlay" aria-hidden="true" />

      <header className="site-header login-header">
        <Brand label="Project Portal" />

        <Link to="/" className="home-link">
          ← Home
        </Link>
      </header>

      <section className="login-layout">
        <div className="login-story">
          <p className="story-label">YOUR PROJECT JOURNEY</p>

          <h1>
            Big Ideas.
            <br />
            <span>Better Projects.</span>
          </h1>

          <p className="story-description">
            Sign in to follow your projects, manage your tasks,
            and stay connected with your team.
          </p>

          <div className="story-decoration">
            <span className="decoration-circle">✓</span>

            <div>
              <strong>Your work matters.</strong>
              <p>Keep your project journey moving forward.</p>
            </div>
          </div>
        </div>

        <section className="login-card">
          <div className="login-card-accent" />

          <div className="login-heading">
            <h2>Welcome Back!</h2>
            <p>Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email or Roll Number</label>

              <div className="input-box">
                <UserIcon />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="input-box">
                <LockIcon />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="text-link"
                onClick={() =>
                  setMessage(
                    "Password recovery is not configured yet."
                  )
                }
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoggingIn}
            >
              <span>
                {isLoggingIn ? "Signing in..." : "Login"}
              </span>

              <span className="button-arrow">→</span>
            </button>
          </form>

          <div className="or-divider">
            <span />
            <p>OR</p>
            <span />
          </div>

          {/* Existing Google button design is unchanged. */}
          <button
            type="button"
            className="google-button"
            disabled={isLoggingIn}
            onClick={handleGoogleLogin}
          >
            <span className="google-letter">G</span>
            <span>Continue with Google</span>
          </button>

          <div className="signup-text">
            <span>Don't have an account?</span>

            <Link to="/register" className="text-link">
              Sign Up
            </Link>
          </div>

          {message && (
            <p className="login-message" role="status">
              {message}
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

/* -------------------------------------------------------
   PAGE 3: NEW USER REGISTRATION
------------------------------------------------------- */

function RegisterPage() {
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(event) {
    event.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setIsRegistering(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            usn: usn.trim().toUpperCase(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      // Automatically log in the newly registered user.
      saveLogin(data, true, navigate);

    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        "Unable to connect to the backend. Please try again."
      );

    } finally {
      setIsRegistering(false);
    }
  }

  return (
    <main className="login-page">
      <div className="page-overlay" aria-hidden="true" />

      <header className="site-header login-header">
        <Brand label="Project Portal" />

        <Link to="/" className="home-link">
          ← Home
        </Link>
      </header>

      <section className="login-layout">
        <div className="login-story">
          <p className="story-label">JOIN OUR CAMPUS</p>

          <h1>
            Start Your
            <br />
            <span>Project Journey.</span>
          </h1>

          <p className="story-description">
            Create your account to manage projects,
            connect with your team and track your progress.
          </p>

          <div className="story-decoration">
            <span className="decoration-circle">✓</span>

            <div>
              <strong>Your journey starts here.</strong>
              <p>Create your account and get started.</p>
            </div>
          </div>
        </div>

        <section className="login-card">
          <div className="login-card-accent" />

          <div className="login-heading">
            <h2>Create Account</h2>
            <p>Enter your details to get started</p>
          </div>

          <form onSubmit={handleRegister}>
            {/* FULL NAME */}
            <div className="input-group">
              <label htmlFor="registerName">Full Name</label>

              <div className="input-box">
                <UserIcon />

                <input
                  id="registerName"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* USN */}
            <div className="input-group">
              <label htmlFor="registerUsn">USN</label>

              <div className="input-box">
                <UserIcon />

                <input
                  id="registerUsn"
                  type="text"
                  value={usn}
                  onChange={(event) =>
                    setUsn(event.target.value.toUpperCase())
                  }
                  placeholder="Enter your USN"
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="input-group">
              <label htmlFor="registerEmail">Email Address</label>

              <div className="input-box">
                <UserIcon />

                <input
                  id="registerEmail"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <label htmlFor="registerPassword">Password</label>

              <div className="input-box">
                <LockIcon />

                <input
                  id="registerPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="input-group">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-box">
                <LockIcon />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* CREATE ACCOUNT BUTTON */}
            <button
              type="submit"
              className="login-button"
              disabled={isRegistering}
            >
              <span>
                {isRegistering
                  ? "Creating account..."
                  : "Create Account"}
              </span>

              <span className="button-arrow">→</span>
            </button>
          </form>

          {message && (
            <p className="login-message" role="alert">
              {message}
            </p>
          )}

          <div className="signup-text">
            <span>Already have an account?</span>

            <Link to="/login" className="text-link">
              Login
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

/* -------------------------------------------------------
   APP ROUTES
------------------------------------------------------- */

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}