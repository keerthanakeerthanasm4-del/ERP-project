import { useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import "./App.css";


/* Graduation cap logo */
function CapIcon() {
  return (
    <svg
      viewBox="0 0 36 30"
      className="cap-icon"
      aria-hidden="true"
    >
      <path d="M2 10 18 2 34 10 18 18 2 10Z" />

      <path d="M8 14v7c6 5 14 5 20 0v-7" />

      <path d="M32 11v10" />

      <circle cx="32" cy="23" r="2" />
    </svg>
  );
}


/* Website logo and name */
function Brand({ label = "Campus Project Tracker" }) {
  return (
    <Link to="/" className="brand">
      <CapIcon />
      <span>{label}</span>
    </Link>
  );
}


/* Simple user icon */
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


/* Simple lock icon */
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


/* ==========================================
   PAGE 1: HOMEPAGE
========================================== */

function HomePage() {
  return (
    <main className="home-page">

      <div className="home-overlay"></div>

      {/* Top navigation */}
      <header className="site-header">
        <Brand />
      </header>


      {/* Left-side decorative message */}
      <div className="home-note home-note-left">
        <span>Your Ideas</span>
        <span>Our Campus</span>
        <span>Better Tomorrow</span>
        <div className="note-underline"></div>
      </div>


      {/* Right-side decorative message */}
      <div className="home-note home-note-right">
        <span>Track</span>
        <span>Manage</span>
        <span>Complete</span>
      </div>


      {/* Main homepage content */}
      <section className="home-hero">

        <p className="hero-kicker">
          <span>Plan</span>
          <span className="dot">·</span>
          <span>Build</span>
          <span className="dot">·</span>
          <span>Succeed</span>
        </p>


        <h1 className="hero-title">
          <span className="title-white">
            CAMPUS
          </span>

          <span className="title-gradient">
            PROJECT TRACKER
          </span>
        </h1>


        <p className="hero-description">
          Turn your ideas into real projects.
          <br />
          Track progress and achieve your goals.
        </p>


        {/* Opens the login page */}
        <Link to="/login" className="get-started-button">
          <span>Get Started</span>

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
        </Link>

      </section>


      {/* Decorative paper airplane */}
      <div className="paper-plane" aria-hidden="true">
        <svg
          viewBox="0 0 70 70"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 35 64 5 44 64 32 42 5 35Z" />
          <path d="M32 42 64 5" />
        </svg>
      </div>


      {/* Decorative bottom waves */}
      <div className="wave wave-one"></div>
      <div className="wave wave-two"></div>

    </main>
  );
}


/* ==========================================
   PAGE 2: LOGIN PAGE
========================================== */

function LoginPage() {

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const [message, setMessage] = useState("");


  function handleLogin(event) {
    event.preventDefault();

    setMessage(
      "Your login form is ready. Backend authentication must be connected to verify your account."
    );
  }


  return (
    <main className="login-page">

      <div className="login-overlay"></div>


      {/* Login page navigation */}
      <header className="site-header login-header">

        <Brand label="Project Portal" />

        <Link to="/" className="home-link">
          ← Home
        </Link>

      </header>


      <section className="login-layout">

        {/* Left-side message */}
        <div className="login-story">

          <p className="story-label">
            YOUR PROJECT JOURNEY
          </p>

          <h1>
            Big Ideas.
            <br />

            <span>Better Projects.</span>
          </h1>

          <p className="story-description">
            Sign in to follow your projects,
            manage your tasks, and stay
            connected with your team.
          </p>


          <div className="story-decoration">

            <span className="decoration-circle">
              ✓
            </span>

            <div>
              <strong>Your work matters.</strong>

              <p>
                Keep your project journey moving forward.
              </p>
            </div>

          </div>

        </div>


        {/* Login form */}
        <section className="login-card">

          <div className="login-card-accent"></div>


          <div className="login-heading">

            <h2>
              Welcome Back!
            </h2>

            <p>
              Sign in to continue
            </p>

          </div>


          <form onSubmit={handleLogin}>

            {/* Email or Roll Number */}
            <div className="input-group">

              <label htmlFor="email">
                Email or Roll Number
              </label>

              <div className="input-box">

                <UserIcon />

                <input
                  id="email"
                  type="text"
                  name="email"
                  placeholder="Email or Roll Number"
                  autoComplete="username"
                  required
                />

              </div>

            </div>


            {/* Password */}
            <div className="input-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-box">

                <LockIcon />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />


                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* Remember me and Forgot Password */}
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
                    "Password recovery needs to be connected to your college account system."
                  )
                }
              >
                Forgot Password?
              </button>

            </div>


            {/* Login button */}
            <button
              type="submit"
              className="login-button"
            >
              <span>Login</span>

              <span className="button-arrow">
                →
              </span>
            </button>

          </form>


          {/* Separator */}
          <div className="or-divider">
            <span></span>

            <p>OR</p>

            <span></span>
          </div>


          {/* Google login placeholder */}
          <button
            type="button"
            className="google-button"
            onClick={() =>
              setMessage(
                "Google sign-in can be enabled after configuring Google authentication."
              )
            }
          >
            <span className="google-letter">
              G
            </span>

            <span>Continue with Google</span>
          </button>


          {/* Sign-up option */}
          <div className="signup-text">

            <span>Don't have an account?</span>

            <button
              type="button"
              className="text-link"
              onClick={() =>
                setMessage(
                  "Account registration can be added to your project workflow."
                )
              }
            >
              Sign Up
            </button>

          </div>


          {/* Messages for the current interaction */}
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


/* ==========================================
   APPLICATION ROUTES
========================================== */

function App() {

  return (
    <Routes>

      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


export default App;