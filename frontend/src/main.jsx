import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, useLocation } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

class RouteErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Page render failed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main role="alert" style={{ minHeight: "100vh", display: "grid", placeContent: "center", gap: 16, padding: 24, background: "#05070d", color: "#f3f1f8", textAlign: "center" }}>
          <h1 style={{ margin: 0 }}>This page couldn’t load</h1>
          <p style={{ margin: 0, color: "#c1c4d4" }}>Return to the login page and try again.</p>
          <Link to="/login" style={{ justifySelf: "center", color: "#ebb7f5" }}>Go to login</Link>
        </main>
      );
    }
    return this.props.children;
  }
}

function RoutedApp() {
  const location = useLocation();
  return (
    <RouteErrorBoundary key={location.key}>
      <App />
    </RouteErrorBoundary>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  </StrictMode>
);
