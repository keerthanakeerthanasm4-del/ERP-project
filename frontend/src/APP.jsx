function App() {
  return (
    <div className="home-page">

      {/* TOP LOGO */}
      <div className="logo-area">
        <div className="cap">🎓</div>
        <div className="logo-text">Campus Project Tracker</div>
      </div>

      {/* PLAN BUILD SUCCEED */}
      <div className="tagline">
        <span>Plan</span>
        <b>·</b>
        <span>Build</span>
        <b>·</b>
        <span>Succeed</span>
      </div>

      {/* LEFT HANDWRITTEN TEXT */}
      <div className="left-text">
        <div>Your Ideas</div>
        <div>Our Campus</div>
        <div>Better Tomorrow</div>
        <div className="underline"></div>
      </div>

      {/* MAIN TITLE */}
      <div className="main-title">
        <div className="campus">CAMPUS</div>

        <div className="project-title">
          <span className="project">PROJECT</span>
          <span className="tracker">TRACKER</span>
        </div>

        <div className="title-line"></div>
      </div>

      {/* PAPER PLANE */}
      <div className="paper-plane">
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 48 L88 10 L62 88 L45 57 L10 48 Z"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          <path
            d="M45 57 L88 10"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <path
            d="M45 57 L47 78"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div className="plane-line"></div>
      </div>

      {/* RIGHT CIRCLE */}
      <div className="right-circle">
        <div>Track</div>
        <div>Manage</div>
        <div>Complete</div>
      </div>

      {/* GET STARTED */}
      <button className="get-started">
        <span>Get Started</span>
        <span className="arrow">→</span>
      </button>

      {/* BOTTOM DECORATION */}
      <div className="bottom-shape left-shape"></div>
      <div className="bottom-shape right-shape"></div>

    </div>
  );
}

export default App;