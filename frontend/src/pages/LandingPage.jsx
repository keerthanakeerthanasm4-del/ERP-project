import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import "./Home.css";

const LINE_ONE = "Your Vision. Your Team. One";
const LINE_TWO = "Powerful Platform.";

/* =====================================================
   EXISTING HEADING ANIMATION — UNCHANGED
===================================================== */

function AnimatedHeading() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const totalLength = LINE_ONE.length + LINE_TWO.length;

  useEffect(() => {
    let count = 0;
    let finishTimeout;

    const interval = window.setInterval(() => {
      count += 1;
      setVisibleCount(count);

      if (count >= totalLength) {
        window.clearInterval(interval);

        finishTimeout = window.setTimeout(() => {
          setFinished(true);
        }, 800);
      }
    }, 75);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(finishTimeout);
    };
  }, [totalLength]);

  const renderLetters = (text, offset) =>
    [...text].map((letter, index) => {
      const isVisible = offset + index < visibleCount;
      const isCurrent = offset + index === visibleCount - 1;

      return (
        <span
          key={`${offset}-${index}`}
          className={
            isVisible
              ? "vision-letter vision-letter-visible"
              : "vision-letter vision-letter-ghost"
          }
        >
          {letter === " " ? "\u00A0" : letter}

          {isCurrent && !finished && (
            <span className="vision-typing-cursor" />
          )}
        </span>
      );
    });

  return (
    <h1
      className="vision-heading"
      aria-label={`${LINE_ONE} ${LINE_TWO}`}
    >
      <span className="vision-heading-line">
        {renderLetters(LINE_ONE, 0)}
      </span>

      <span className="vision-heading-line">
        {renderLetters(LINE_TWO, LINE_ONE.length)}
      </span>
    </h1>
  );
}

/* =====================================================
   EXISTING ROTATING LIGHT — UNCHANGED
===================================================== */

function RotatingLight() {
  return (
    <div className="vision-light-system" aria-hidden="true">
      <div className="vision-light-glow" />

      <div className="vision-light-rotation">
        <div className="vision-light-ray vision-light-ray-one" />
        <div className="vision-light-ray vision-light-ray-two" />
        <div className="vision-light-ray vision-light-ray-three" />
      </div>

      <div className="vision-light-core" />
    </div>
  );
}

/* =====================================================
   CARD 1 — JOINT BOARD
   DESIGN UNCHANGED
===================================================== */

function JointBoardCard() {
  return (
    <div className="vision-floating-card vision-joint-card">
      <div className="vision-joint-inner">
        <svg
          className="vision-signature"
          viewBox="0 0 240 130"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M30 80 C55 62 74 44 104 35"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M85 22 L96 98"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M99 77 C110 58 115 64 119 70 C128 52 132 70 140 67 C151 56 157 68 166 72 C177 85 186 83 199 74"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M63 105 H199"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <path
            d="M90 119 H178"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <span className="vision-joint-label">
        Joint Board
      </span>
    </div>
  );
}

/* =====================================================
   CARD 2 — NEW BRIEF
   DESIGN UNCHANGED
===================================================== */

function NewBriefCard() {
  return (
    <div className="vision-floating-card vision-brief-card">
      <svg
        className="vision-brief-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M6 2h8l5 5v14a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
        <path d="M14 2v6h6" fill="#8d9bbd" />
      </svg>

      <span className="vision-brief-label">
        New Brief{" "}
        <span className="vision-pink-star">✦</span>
      </span>
    </div>
  );
}

/* =====================================================
   CARD 3 — MEETING
   DESIGN UNCHANGED
===================================================== */

function MeetingCard() {
  return (
    <div className="vision-floating-card vision-meeting-card">
      <svg
        className="vision-video-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="2" y="5" width="14" height="14" rx="3" />
        <path d="M17 10 22 7v10l-5-3Z" />
      </svg>

      <span>Meeting on 1:00 PM</span>
    </div>
  );
}

/* =====================================================
   CARD 4 — SAVE / SEND
   DESIGN UNCHANGED
===================================================== */

function WorkflowCard() {
  return (
    <div className="vision-floating-card vision-workflow-card">
      <div className="vision-workflow-top">
        <div className="vision-workflow-small-box" />

        <div className="vision-workflow-save-area">
          <span className="vision-workflow-star">✦</span>

          <span className="vision-save-pill">
            Save
          </span>
        </div>

        <div className="vision-workflow-lines">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="vision-workflow-bottom">
        <div className="vision-workflow-placeholder" />
        <div className="vision-workflow-placeholder" />

        <span className="vision-send-pill">
          Send <span>➜</span>
        </span>
      </div>

      <div className="vision-workflow-footer" />
    </div>
  );
}

/* =====================================================
   NEW ANIMATION — VIDEO 2 FLOATING MOTION

   Only GSAP animation is changed.

   Original card positions remain controlled
   by your existing Home.css.
===================================================== */

function FloatingCards({ cardsRef }) {
  return (
    <div
      className="vision-cards-layer"
      ref={cardsRef}
    >
      <JointBoardCard />
      <NewBriefCard />
      <MeetingCard />
      <WorkflowCard />
    </div>
  );
}

/* =====================================================
   EXISTING BLUE PLANET — UNCHANGED

   The existing edge is rendered separately
   above the cards, using its original CSS.

   No second arc is created.
===================================================== */

function BluePlanet() {
  return (
    <>
      <div
        className="vision-planet-system"
        aria-hidden="true"
      >
        <div className="vision-planet-glow" />
        <div className="vision-planet" />
      </div>
    </>
  );
}

/* =====================================================
   ORIGINAL ARC — SAME ELEMENT, SAME CURVE

   We have moved the original edge into a
   higher stacking layer.

   It is NOT a duplicate arc.
===================================================== */

function OriginalArc({ arcRef }) {
  return (
    <div
      className="vision-planet-system vision-arc-front-layer"
      aria-hidden="true"
    >
      <div
        ref={arcRef}
        className="vision-planet-edge"
      />
    </div>
  );
}

/* =====================================================
   LANDING PAGE
===================================================== */

export default function Home() {
  const navigate = useNavigate();

  const cardsRef = useRef(null);
  const arcRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const cardsContainer = cardsRef.current;
    const arc = arcRef.current;

    if (!cardsContainer || !arc) return;

    const cards = gsap.utils.toArray(
      ".vision-floating-card",
      cardsContainer
    );

    if (cards.length !== 4) return;

    /* -----------------------------------------
       STEP 1 — INITIAL CARD STATES

       Small movement, rotation, and opacity
       for a smooth floating appearance.
    ----------------------------------------- */

    const initialStates = [
      {
        x: -55,
        y: 38,
        rotation: -6,
        scale: 0.94,
      },
      {
        x: -28,
        y: -35,
        rotation: -5,
        scale: 0.92,
      },
      {
        x: 35,
        y: -42,
        rotation: 5,
        scale: 0.92,
      },
      {
        x: 60,
        y: 35,
        rotation: 6,
        scale: 0.94,
      },
    ];

    cards.forEach((card, index) => {
      gsap.set(card, {
        ...initialStates[index],
        opacity: 0,
        transformOrigin: "center center",
      });
    });

    /* -----------------------------------------
       STEP 2 — HIDE THE ORIGINAL ARC

       CSS mask reveals the same original
       curved border from left to right.
    ----------------------------------------- */

    gsap.set(arc, {
      WebkitMaskImage:
        "linear-gradient(to right, black, black)",
      maskImage:
        "linear-gradient(to right, black, black)",

      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",

      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",

      clipPath: "inset(0 100% 0 0)",
    });

    /* -----------------------------------------
       STEP 3 — SHARED GSAP TIMELINE

       Cards and existing arc animate together.
    ----------------------------------------- */

    const timeline = gsap.timeline({
      defaults: {
        ease: "power2.out",
      },
    });

    animationRef.current = timeline;

    /* -----------------------------------------
       EXISTING ARC LOADING

       Duration: 2.8 seconds
       Direction: left to right

       No new stroke or line is drawn.
    ----------------------------------------- */

    timeline.to(
      arc,
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 6,
        ease: "power1.inOut",
      },
      0.15
    );

    /* -----------------------------------------
       FOUR-CARD FLOATING MOTION

       Inspired by the staggered appearance
       in Video 2.

       The CSS-defined final positions are
       preserved because all transforms
       finish at zero.
    ----------------------------------------- */

    const entranceTimes = [
      0.15,
      0.42,
      0.68,
      0.94,
    ];

    cards.forEach((card, index) => {
      timeline.to(
        card,
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,

          duration: 1.45,

          ease: "power3.out",
        },
        entranceTimes[index]
      );
    });

    /* -----------------------------------------
       GENTLE SETTLING MOTION

       A subtle floating effect after the
       entrance completes.

       Cards return to their exact original
       CSS positions at the end.
    ----------------------------------------- */

    cards.forEach((card, index) => {
      timeline.fromTo(
        card,
        {
          y: index % 2 === 0 ? -7 : 7,
        },
        {
          y: 0,
          duration: 0.65,
          ease: "sine.out",
        },
        2.15 + index * 0.1
      );
    });

    /* -----------------------------------------
       CLEANUP
    ----------------------------------------- */

    return () => {
      timeline.kill();

      gsap.set(cards, {
        clearProps:
          "transform,opacity,transformOrigin",
      });

      gsap.set(arc, {
        clearProps:
          "clipPath,maskImage,maskSize,maskRepeat,WebkitMaskImage,WebkitMaskSize,WebkitMaskRepeat",
      });

      animationRef.current = null;
    };
  }, []);

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <main className="vision-home">
      <div className="vision-window">

        {/* EXISTING BACKGROUND */}

        <div className="vision-background-glow" />

        {/* EXISTING STARS */}

        <div
          className="vision-stars"
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* EXISTING ROTATING LIGHT */}

        <RotatingLight />

        {/* EXISTING HERO TEXT */}

        <section className="vision-hero">
          <AnimatedHeading />

          <p className="vision-description">
            Manage tasks, collaborate in real-time, and stay on
            top of your team’s
            <br />
            productivity—all in one beautifully intuitive
            workspace.
          </p>

          <button
            type="button"
            className="vision-start-button"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </section>

        {/* ORIGINAL FOUR CARDS */}

        <FloatingCards cardsRef={cardsRef} />

        {/* ORIGINAL PLANET */}

        <BluePlanet />

        {/* ORIGINAL ARC — NOW ABOVE THE CARDS */}

        <OriginalArc arcRef={arcRef} />

      </div>
    </main>
  );
}