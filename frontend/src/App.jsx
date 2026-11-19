import HODDashboard from "./HOD/HOD pages/HODDashboard.jsx";
import { useState, useEffect, useRef } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import portalNebula from "./assets/portal-nebula.webp";
import Dashboard from "./Dashboard";
import { API_URL } from "./api.js";
import ProjectLeadDashboard from "./PROJECTLEAD/jsx/ProjectLeadDashboard.jsx";
import CreateProject from "./PROJECTLEAD/jsx/CreateProject.jsx";
import ProjectDetails from "./PROJECTLEAD/jsx/ProjectDetails.jsx";
import ProjectLeadProfile from "./PROJECTLEAD/jsx/ProjectLeadProfile.jsx";
import ProjectLeadCover from "./PROJECTLEAD/jsx/ProjectLeadCover.jsx";
import ProjectLeadLayout from "./PROJECTLEAD/jsx/ProjectLeadLayout.jsx";
import { ProjectLeadProjects } from "./PROJECTLEAD/jsx/ProjectLeadSections.jsx";
import Home from "./pages/LandingPage";

/* =========================================================
   API CONFIGURATION — UNCHANGED
========================================================= */

const GOOGLE_CLIENT_ID = "935746879596-3bi48aq1oqekpld9segrobopoph05pvk.apps.googleusercontent.com";

/* =========================================================
   EXISTING SHARED ICONS
========================================================= */

function UserIcon() {
  return <svg viewBox="0 0 24 24" className="field-icon" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2Z" />
    </svg>;
}
function LockIcon() {
  return <svg viewBox="0 0 24 24" className="field-icon" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="10" width="16" height="12" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14v4" />
    </svg>;
}

/* =========================================================
   EXISTING LOGIN STORAGE — UNCHANGED
========================================================= */

function saveLogin(data, rememberMe, navigate) {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  if (rememberMe) {
    localStorage.setItem("token", data.token);
  } else {
    sessionStorage.setItem("token", data.token);
  }

  localStorage.setItem("user", JSON.stringify(data.user));

  if (data.user?.role === "PROJECT_LEAD") {
    const accountId =
      data.user.id ?? data.user.user_id ?? data.user.email ?? data.user.usn;
    const seenKey = accountId
      ? "projectLeadCoverSeen:" + String(accountId).trim().toLowerCase()
      : null;
    const hasSeenCover = seenKey && localStorage.getItem(seenKey) === "true";

    if (seenKey && !hasSeenCover) {
      localStorage.setItem(seenKey, "true");
      navigate("/project-lead/welcome", {
        replace: true,
        state: { firstLoginCover: true },
      });
      return;
    }
  }

  navigate(data.user?.role === "PROJECT_LEAD" ? "/project-lead/dashboard" : "/dashboard");
}

/* =========================================================
   SHARED AUTHENTICATION STYLES

   FIX:
   Both LoginPage and RegisterPage use these styles.

   Previously the CSS existed only inside LoginPage,
   which caused the Register page to show a huge planet
   and a light background.

   Everything remains inside App.jsx.
========================================================= */

const AUTH_STYLES = `

  .erp-auth-scene {
    --electric: #16b9ff;

    position: relative;
    isolation: isolate;

    width: 100%;
    min-height: 100vh;

    overflow: hidden;

    background: radial-gradient(
      ellipse at 50% 102%,
      #07348b 0%,
      #031b48 30%,
      #020e29 70%,
      #010b21 100%
    );

    color: #f6faff;
    font-family: Inter, Arial, sans-serif;

    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 14px 22px 95px;
  }

  .erp-auth-scene * {
    box-sizing: border-box;
  }

  /* ============================================
     MOVING BACKGROUND STARS
  ============================================ */

  .erp-stars {
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;

    background-image:
      radial-gradient(circle, #75cbff 1px, transparent 2px),
      radial-gradient(circle, #308bff 1px, transparent 2px);

    background-size:
      177px 151px,
      263px 213px;

    background-position:
      22px 29px,
      95px 82px;

    opacity: .65;

    animation: erpTwinkle 1s linear infinite alternate;
  }

  @keyframes erpTwinkle {
    0% {
      opacity: .45;
      background-position: 22px 29px, 95px 82px;
    }

    50% {
      opacity: .75;
      background-position: 30px 22px, 88px 90px;
    }

    100% {
      opacity: .45;
      background-position: 38px 15px, 81px 98px;
    }
  }

  /* ============================================
     ROTATING BLUE LIGHT — TOP RIGHT
  ============================================ */

  .erp-rays {
    position: absolute;

    right: -170px;
    top: -230px;

    width: 720px;
    height: 680px;

    z-index: -1;
    pointer-events: none;

    transform-origin: 75% 15%;

    background: repeating-conic-gradient(
      from 220deg at 77% 17%,
      transparent 0deg,
      rgba(24,118,255,.03) 4deg,
      rgba(42,170,255,.2) 7deg,
      rgba(191,242,255,.7) 8deg,
      rgba(34,136,255,.14) 10deg,
      transparent 16deg
    );

    filter: blur(8px);

    mask-image: radial-gradient(
      ellipse at 70% 20%,
      #000 10%,
      transparent 75%
    );

    animation: erpRayTurn 24s linear infinite;
  }

  .erp-rays::after {
    content: "";

    position: absolute;
    inset: 0;

    background: radial-gradient(
      ellipse at 70% 16%,
      rgba(183,245,255,.8),
      transparent 37%
    );
  }

  @keyframes erpRayTurn {
    to {
      transform: rotate(360deg);
    }
  }

  /* ============================================
     ERP BRAND
  ============================================ */

  .erp-auth-brand {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 15px;
    margin-bottom: 32px;

    position: relative;
    z-index: 3;
  }

  .erp-auth-brand svg {
    width: 96px;
    height: 73px;

    filter: drop-shadow(0 0 14px #0c8aff);
  }

  .erp-auth-brand strong {
    display: block;

    font-size: 43px;
    line-height: 1;
    font-weight: 800;

    letter-spacing: -1px;
  }

  .erp-auth-brand small {
    display: block;

    font-size: 16px;
    margin-top: 4px;

    color: #e5edff;
  }

  /* ============================================
     LOGIN PAGE — EXISTING STYLES
  ============================================ */

  .erp-login-stage {
    position: relative;

    width: min(100%, 1380px);

    display: flex;
    justify-content: center;
    align-items: center;

    flex: 1;
  }

  .erp-login-panel {
    position: relative;
    z-index: 3;

    width: min(100%, 710px);

    padding: 53px 78px 29px;

    border: 2px solid #26b9ff;
    border-radius: 42px;

    background: linear-gradient(
      150deg,
      rgba(5,28,66,.92),
      rgba(1,13,38,.96)
    );

    box-shadow:
      0 0 12px #079cff,
      0 0 38px rgba(0,104,255,.48),
      inset 0 0 20px rgba(13,115,245,.22);
  }

  .erp-login-panel::before {
    content: "";

    position: absolute;
    inset: -2px;

    border-radius: 42px;
    pointer-events: none;

    box-shadow: inset 0 0 9px #2fcaff;
  }

  .erp-avatar {
    position: absolute;

    left: 50%;
    top: -29px;

    transform: translateX(-50%);

    width: 84px;
    height: 82px;

    display: grid;
    place-items: center;

    border: 2px solid #26baff;
    border-radius: 17px;

    background: linear-gradient(
      150deg,
      #103d83,
      #021436
    );

    box-shadow:
      0 0 9px #3bd6ff,
      0 0 22px #0b6eff;
  }

  .erp-avatar svg {
    width: 51px;
    height: 51px;

    stroke: #a5e8ff;
    fill: none;
    stroke-width: 1.5;

    filter: drop-shadow(0 0 5px #2cbfff);
  }

  .erp-login-title {
    text-align: center;
    margin: 7px 0 23px;
  }

  .erp-login-title h1 {
    font-size: clamp(31px, 3.3vw, 49px);
    line-height: 1.1;

    margin: 0;

    font-weight: 800;
    letter-spacing: -1.6px;

    color: white;
  }

  .erp-login-title h1 span {
    color: #4baaff;
  }

  .erp-login-title p {
    font-size: 19px;
    margin: 8px 0 0;

    color: #e9f3ff;
  }

  /* ============================================
     SHARED INPUT FIELDS
  ============================================ */

  .erp-auth-scene .erp-field {
    margin-bottom: 17px;
  }

  .erp-auth-scene .erp-field label {
    display: block;

    font-size: 17px;
    margin-bottom: 7px;

    color: #f5f8ff;
    font-weight: 500;
  }

  .erp-input-wrap {
    display: flex;
    align-items: center;

    gap: 13px;

    height: 54px;
    padding: 0 17px;

    border: 1px solid #3c679d;
    border-radius: 999px;

    background: linear-gradient(
      #19345b,
      #112744
    );

    box-shadow:
      inset 0 2px 8px rgba(0,0,0,.35),
      0 0 4px rgba(67,151,255,.28);
  }

  .erp-input-wrap:focus-within {
    border-color: #65caff;

    box-shadow:
      0 0 10px rgba(37,164,255,.5);
  }

  .erp-input-wrap svg {
    width: 23px;
    height: 23px;

    flex: none;

    stroke: #72c2ff;
    fill: none;
    stroke-width: 1.8;
  }

  .erp-input-wrap input {
    width: 100%;
    min-width: 0;
    height: 100%;

    border: 0;
    outline: 0;

    background: transparent;
    color: #fff;

    font-size: 16px;
  }

  .erp-input-wrap input::placeholder {
    color: #e1e7f1;
    opacity: 1;
  }

  .erp-eye {
    background: transparent;
    border: 0;

    color: #afc7e6;

    cursor: pointer;

    display: grid;
    place-items: center;

    padding: 5px;
  }

  .erp-eye svg {
    width: 23px;
    height: 23px;
    stroke: #afc7e6;
  }

  /* ============================================
     LOGIN ACTIONS
  ============================================ */

  .erp-login-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 10px;
    margin: 13px 0 21px;
  }

  .erp-remember {
    display: flex;
    align-items: center;

    gap: 10px;

    color: #70c8ff;
    font-size: 16px;

    cursor: pointer;
  }

  .erp-remember input {
    width: 20px;
    height: 20px;

    accent-color: #147fff;
  }

  .erp-forgot {
    border: 0;
    background: none;

    color: #79c9ff;
    font-size: 16px;

    cursor: pointer;
  }

  /* ============================================
     BLUE LOGIN BUTTON
  ============================================ */

  .erp-submit {
    width: 100%;
    height: 61px;

    border: 1px solid #6ceaff;
    border-radius: 999px;

    background: linear-gradient(
      100deg,
      #40c9ff,
      #0863eb 50%,
      #27b9ff
    );

    box-shadow:
      0 0 11px #20baff,
      inset 0 0 9px rgba(255,255,255,.38);

    color: white;

    font-size: 23px;
    font-weight: 800;

    cursor: pointer;

    transition:
      filter .2s,
      transform .2s;
  }

  .erp-submit:hover:not(:disabled) {
    filter: brightness(1.14);
    transform: translateY(-2px);
  }

  .erp-submit:disabled,
  .erp-google:disabled {
    opacity: .65;
    cursor: wait;
  }

  .erp-submit span {
    font-size: 29px;
    margin-left: 12px;
    font-weight: 400;
  }

  /* ============================================
     GOOGLE LOGIN
  ============================================ */

  .erp-or {
    display: flex;
    align-items: center;

    gap: 18px;

    margin: 19px 0 17px;

    color: white;
    font-size: 15px;
  }

  .erp-or::before,
  .erp-or::after {
    content: "";

    height: 1px;
    background: #2c4566;

    flex: 1;
  }

  .erp-google {
    width: 100%;
    height: 57px;

    border-radius: 999px;
    border: 1px solid #a7d7ff;

    background: linear-gradient(
      #233d5c,
      #112840
    );

    color: white;

    font-size: 17px;
    font-weight: 600;

    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 12px;

    box-shadow:
      inset 0 1px 3px rgba(255,255,255,.2);
  }

  .erp-google-g {
    font-size: 26px;
    font-weight: 900;

    background: conic-gradient(
      #4285f4 0 25%,
      #34a853 25% 50%,
      #fbbc05 50% 75%,
      #ea4335 75%
    );

    background-clip: text;
    -webkit-background-clip: text;

    color: transparent;
  }

  .erp-signup {
    text-align: center;

    margin: 23px 0 0;

    font-size: 16px;
    color: #e3edff;
  }

  .erp-signup a {
    color: #38b9ff;
    font-weight: 700;
    margin-left: 9px;
  }

  .erp-auth-message {
    text-align: center;

    color: #ffd1d1;

    margin: 15px 0 0;

    font-size: 13px;
  }

  /* ============================================
     LOGIN ILLUSTRATIONS
  ============================================ */

  .erp-art {
    position: absolute;
    z-index: 2;

    width: clamp(220px, 25vw, 380px);
    height: auto;

    overflow: visible;

    filter:
      drop-shadow(0 0 15px rgba(0,138,255,.65));

    pointer-events: none;

    animation: erpFloat 5s ease-in-out infinite;
  }

 .erp-art-left {
  left: max(-5%, calc(50% - 820px));
  top: 50%;

  transform: translateY(-40%);
}

.erp-art-right {
  right: max(-5%, calc(50% - 820px));
  top: 50%;

  transform: translateY(-40%);

  animation-delay: -2s;
}s

  @keyframes erpFloat {
    0%, 100% {
      translate: 0 0;
    }

    50% {
      translate: 0 -14px;
    }
  }

  /* ============================================
     BOTTOM GLOWING ARC
  ============================================ */

  .erp-horizon {
    position: absolute;
    z-index: 1;

    bottom: -305px;
    left: 50%;

    width: 150vw;
    height: 390px;

    transform: translateX(-50%);

    border-top: 4px solid #65d7ff;
    border-radius: 50% 50% 0 0;

    box-shadow:
      0 -7px 15px #188bff,
      0 -14px 38px rgba(0,97,255,.8),
      inset 0 22px 35px rgba(5,72,199,.3);

    pointer-events: none;
  }

  .erp-auth-home {
    position: absolute;

    left: 25px;
    top: 24px;

    color: #9bd9ff;
    font-size: 13px;

    z-index: 5;
  }

  /* ============================================
     EXISTING LOGIN RESPONSIVE STYLES
  ============================================ */

  @media (max-width: 1250px) {
    .erp-art {
      width: 23vw;
      opacity: .8;
    }

    .erp-login-panel {
      width: min(100%, 640px);
      padding-left: 55px;
      padding-right: 55px;
    }
  }

  @media (max-width: 1000px) {
    .erp-art {
      opacity: .24;
    }

    .erp-login-panel {
      width: min(100%, 680px);
    }

    .erp-auth-scene {
      padding-bottom: 75px;
    }
  }

  @media (max-width: 600px) {
    .erp-auth-scene {
      padding: 75px 14px 85px;
      overflow: hidden;
    }

    .erp-auth-brand {
      margin-bottom: 42px;
    }

    .erp-auth-brand svg {
  width: 96px;
  height: 73px;

  overflow: visible;

  filter: drop-shadow(0 0 14px #0c8aff);
}

.erp-revolving-planet {
  transform-origin: center;
  animation: erpEarthRevolve 8s linear infinite;
}

@keyframes erpEarthRevolve {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.erp-planet-ring {
  transform: none;
  animation: none;
}

    .erp-auth-brand strong {
      font-size: 30px;
    }

    .erp-auth-brand small {
      font-size: 12px;
    }

    .erp-login-panel {
      padding: 52px 20px 27px;
      border-radius: 27px;
    }

    .erp-login-title p {
      font-size: 15px;
    }

    .erp-auth-scene .erp-field label {
      font-size: 14px;
    }

    .erp-remember,
    .erp-forgot {
      font-size: 12px;
    }

    .erp-login-actions {
      gap: 4px;
    }

    .erp-art {
      display: none;
    }

    .erp-signup {
      font-size: 13px;
    }

    .erp-horizon {
      bottom: -335px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .erp-rays,
    .erp-stars,
    .erp-art {
      animation: none;
    }
  }
`;

const LOGIN_GALAXY_STYLES = `
  /* Login-only galaxy palette; registration styles stay untouched. */
  .erp-auth-scene:not(.erp-register-scene) {
    background:
      radial-gradient(ellipse at 85% 4%, rgba(105, 73, 176, .2), transparent 34%),
      radial-gradient(ellipse at 50% 103%, rgba(54, 75, 169, .24), transparent 42%),
      #05070d;
    color: #f3f1f8;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-stars {
    background-image:
      radial-gradient(circle, #e8e9ff 1px, transparent 2px),
      radial-gradient(circle, #7895e8 1px, transparent 2px),
      radial-gradient(circle, #f2b36e 1px, transparent 2px);
    background-size: 177px 151px, 263px 213px, 347px 281px;
    background-position: 22px 29px, 95px 82px, 63px 117px;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-rays {
    background: repeating-conic-gradient(
      from 220deg at 77% 17%,
      transparent 0deg,
      rgba(77, 102, 206, .04) 4deg,
      rgba(112, 89, 207, .18) 7deg,
      rgba(205, 194, 255, .48) 8deg,
      rgba(76, 113, 224, .12) 10deg,
      transparent 16deg
    );
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-rays::after {
    background: radial-gradient(ellipse at 70% 16%, rgba(192, 174, 255, .56), transparent 37%);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-auth-brand svg {
    filter: hue-rotate(58deg) saturate(.88) drop-shadow(0 0 14px rgba(126, 104, 236, .72));
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-login-panel {
    border-color: #8069c9;
    background: linear-gradient(150deg, #091221, #060d18);
    box-shadow:
      0 0 12px rgba(109, 92, 211, .54),
      0 0 38px rgba(63, 67, 156, .3),
      inset 0 0 20px rgba(83, 76, 154, .18);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-login-panel::before {
    box-shadow: inset 0 0 9px rgba(170, 145, 255, .62);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-avatar {
    border-color: #edab60;
    background: linear-gradient(150deg, #171922, #090c14);
    box-shadow: 0 0 9px rgba(180, 157, 255, .78), 0 0 22px rgba(111, 85, 220, .58);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-avatar svg {
    stroke: #ffbb69;
    filter: drop-shadow(0 0 5px rgba(173, 148, 255, .65));
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-login-title h1 span,
  .erp-auth-scene:not(.erp-register-scene) .erp-signup a {
    color: #ebb7f5;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-login-title p,
  .erp-auth-scene:not(.erp-register-scene) .erp-signup {
    color: #c1c4d4;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-input-wrap {
    border-color: #394568;
    background: linear-gradient(#0b1427, #091221);
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, .35), 0 0 4px rgba(91, 97, 177, .18);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-input-wrap:focus-within {
    border-color: #9a82e4;
    box-shadow: 0 0 10px rgba(141, 116, 235, .42);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-input-wrap svg,
  .erp-auth-scene:not(.erp-register-scene) .erp-eye svg {
    stroke: #b9a9f4;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-input-wrap input::placeholder {
    color: #a8aabd;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-remember {
    color: #c2b4f2;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-remember input {
    accent-color: #f2a65a;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-forgot,
  .erp-auth-scene:not(.erp-register-scene) .erp-auth-home {
    color: #b6a2f4;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-submit {
    border-color: #ffc27e;
    background: linear-gradient(100deg, #eea25a, #de8b48);
    box-shadow: 0 0 12px rgba(242, 166, 90, .4), inset 0 0 9px rgba(255, 255, 255, .28);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-submit:hover:not(:disabled) {
    filter: brightness(1.08);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-or::before,
  .erp-auth-scene:not(.erp-register-scene) .erp-or::after {
    background: #41415c;
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-google {
    border-color: #555675;
    background: linear-gradient(#1d2238, #12182a);
    box-shadow: inset 0 1px 3px rgba(255, 255, 255, .1);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-art {
    filter: drop-shadow(0 0 8px rgba(111, 103, 213, .22));
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-horizon {
    border-top-color: rgba(151, 135, 255, .98);
    box-shadow:
      0 -7px 18px rgba(81, 125, 255, .92),
      0 -14px 42px rgba(115, 79, 238, .76),
      0 -2px 9px rgba(242, 166, 90, .54),
      inset 0 22px 35px rgba(77, 66, 164, .3);
  }

  .erp-auth-scene:not(.erp-register-scene) .erp-horizon::after {
    content: "";
    position: absolute;
    inset: -4px 0 0;
    border-radius: inherit;
    padding-top: 3px;
    background: linear-gradient(90deg, #233a80 10%, #6088ff 29%, #ffc584 31%, #80a0ff 33%, #a891ff 52%, #d69eff 70%, #ffc584 74%, #b69fff 76%, #4978df 90%);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    pointer-events: none;
  }

  .erp-auth-scene:not(.erp-register-scene) {
    background: #02050c url("${portalNebula}") center / cover no-repeat;
  }
  .erp-auth-scene:not(.erp-register-scene) .erp-login-panel {
    border-color: #8170b7;
    box-shadow: 0 0 12px rgba(113, 80, 200, .23);
  }
  .erp-auth-scene:not(.erp-register-scene) .erp-login-panel::before {
    box-shadow: inset 0 0 5px rgba(172, 145, 255, .16);
  }
  .erp-auth-scene:not(.erp-register-scene) .erp-avatar {
    border-color: #e3a057;
    box-shadow: 0 0 9px rgba(226, 151, 74, .2);
  }
  .erp-auth-scene:not(.erp-register-scene) .erp-avatar svg {
    filter: none;
  }
  .erp-auth-scene:not(.erp-register-scene) .erp-remember,
  .erp-auth-scene:not(.erp-register-scene) .erp-forgot {
    color: #e4e4ee;
  }
  .erp-auth-scene:not(.erp-register-scene) .erp-google {
    border-color: #243450;
    background: linear-gradient(#0b1427, #091221);
  }
  .erp-auth-scene:not(.erp-register-scene) .erp-submit {
    box-shadow: inset 0 1px 2px rgba(255,255,255,.2);
  }
`;

/* =========================================================
   NEW CREATE ACCOUNT STYLES

   These apply ONLY to RegisterPage.

   LoginPage is not affected.
========================================================= */

const REGISTER_STYLES = `

  /* ============================================
     REGISTER PAGE SCENE
  ============================================ */

  .erp-register-scene {
    min-height: 100vh;
    min-height: 100dvh;

    padding: 12px 22px 65px;

    overflow: hidden;

    background: radial-gradient(
      ellipse at 50% 103%,
      #083a96 0%,
      #031a46 27%,
      #020e29 65%,
      #010b21 100%
    );
  }

  .erp-register-scene .erp-auth-brand {
    margin-bottom: 25px;
  }

  /* ============================================
     REGISTER STAGE
  ============================================ */

  .erp-register-stage {
    position: relative;

    width: min(100%, 1500px);

    display: flex;
    align-items: center;
    justify-content: center;

    flex: 1;
    min-height: 0;
  }

  /* ============================================
     MAIN CREATE ACCOUNT BOX

     LIGHT ONLY AROUND THE EDGES
  ============================================ */

  .erp-register-panel {
    position: relative;
    z-index: 3;

    width: min(100%, 712px);

    padding: 48px 76px 24px;

    border: 1.5px solid #42c5ff;
    border-radius: 40px;

    background: linear-gradient(
      155deg,
      rgba(4,20,48,.97) 0%,
      rgba(2,13,35,.98) 55%,
      rgba(3,19,47,.98) 100%
    );

    box-shadow:
      0 0 5px rgba(96,210,255,.95),
      0 0 14px rgba(12,129,255,.42),
      0 0 28px rgba(8,83,210,.14),
      inset 0 0 5px rgba(37,161,255,.13);
  }

  .erp-register-panel::before {
    content: "";

    position: absolute;
    inset: -1px;

    border-radius: 40px;

    pointer-events: none;

    box-shadow:
      inset 0 0 6px rgba(80,210,255,.32);
  }

  /* ============================================
     TOP CREATE ACCOUNT ICON
  ============================================ */

  .erp-register-avatar {
    position: absolute;

    top: -30px;
    left: 50%;

    transform: translateX(-50%);

    width: 86px;
    height: 80px;

    display: grid;
    place-items: center;

    border: 2px solid #38c5ff;
    border-radius: 17px;

    background: linear-gradient(
      150deg,
      #113f85,
      #031735
    );

    box-shadow:
      0 0 8px #3bd6ff,
      0 0 22px rgba(8,112,255,.7),
      inset 0 0 12px rgba(31,140,255,.35);
  }

  .erp-register-avatar svg {
    width: 50px;
    height: 50px;

    fill: none;

    stroke: #d4f6ff;
    stroke-width: 1.7;

    stroke-linecap: round;
    stroke-linejoin: round;

    filter:
      drop-shadow(0 0 5px #48baff);
  }

  /* ============================================
     REGISTER HEADING
  ============================================ */

  .erp-register-heading {
    text-align: center;

    margin: 7px 0 15px;
  }

  .erp-register-heading h1 {
    margin: 0;

    color: #fff;

    font-size: clamp(29px, 3vw, 46px);
    line-height: 1.15;

    font-weight: 800;
    letter-spacing: -1.4px;
  }

  .erp-register-heading p {
    margin: 9px auto 0;

    max-width: 520px;

    color: #eaf3ff;

    font-size: 16px;
    line-height: 1.4;
  }

  /* ============================================
     REGISTER FORM
  ============================================ */

  .erp-register-panel .erp-field {
    margin-bottom: 10px;
  }

  .erp-register-panel .erp-field label {
    display: block;

    margin-bottom: 5px;

    font-size: 15px;
    font-weight: 500;

    color: #f8fbff;
  }

  .erp-register-panel .erp-input-wrap {
    height: 46px;

    padding: 0 18px;

    border: 1px solid #426c9e;
    border-radius: 999px;

    background: linear-gradient(
      180deg,
      #19365e 0%,
      #102744 100%
    );

    box-shadow:
      inset 0 2px 7px rgba(0,0,0,.35),
      0 0 5px rgba(39,138,255,.18);
  }

  .erp-register-panel .erp-input-wrap:focus-within {
    border-color: #70d8ff;

    box-shadow:
      0 0 8px rgba(24,156,255,.48),
      inset 0 2px 7px rgba(0,0,0,.2);
  }

  .erp-register-panel .erp-input-wrap input {
    font-size: 15px;
  }

  .erp-register-panel .erp-input-wrap svg {
    width: 22px;
    height: 22px;

    stroke: #9edbff;
  }

  /* ============================================
     PASSWORD EYE ICONS
  ============================================ */

  .erp-register-panel .erp-eye {
    flex: none;

    width: 32px;
    height: 32px;

    display: grid;
    place-items: center;

    padding: 3px;

    background: transparent;
    border: 0;

    cursor: pointer;
  }

  .erp-register-panel .erp-eye svg {
    width: 22px;
    height: 22px;

    fill: none;

    stroke: #c5dcf6;
    stroke-width: 1.8;

    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* ============================================
     CREATE ACCOUNT BUTTON
  ============================================ */

  .erp-register-submit {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 13px;

    width: 100%;
    height: 57px;

    margin-top: 18px;

    border: 1.5px solid #72e9ff;
    border-radius: 999px;

    background: linear-gradient(
      100deg,
      #43caff 0%,
      #1268e8 25%,
      #0952c8 53%,
      #116de7 77%,
      #39c6ff 100%
    );

    box-shadow:
      0 0 9px #22baff,
      0 0 18px rgba(14,121,255,.5),
      inset 0 2px 9px rgba(255,255,255,.32);

    color: white;

    font-size: 21px;
    font-weight: 800;

    cursor: pointer;

    transition:
      filter .2s ease,
      transform .2s ease;
  }

  .erp-register-submit:hover:not(:disabled) {
    filter: brightness(1.12);
    transform: translateY(-2px);
  }

  .erp-register-submit:disabled {
    opacity: .65;
    cursor: wait;
  }

  .erp-register-submit span {
    font-size: 29px;
    line-height: 1;

    font-weight: 400;
  }

  /* ============================================
     BOTTOM LOGIN LINK
  ============================================ */

  .erp-register-login {
    margin-top: 22px;

    text-align: center;

    color: #eaf2ff;
    font-size: 15px;
  }

  .erp-register-login a {
    margin-left: 12px;

    color: #48c4ff;

    font-size: 16px;
    font-weight: 700;

    text-decoration: none;
  }

  .erp-register-login a:hover {
    text-decoration: underline;
  }

  /* ============================================
     FLOATING LEFT AND RIGHT ILLUSTRATIONS
  ============================================ */

  .erp-register-art {
    position: absolute;
    z-index: 2;

    width: clamp(200px, 23vw, 350px);
    height: auto;

    overflow: visible;

    pointer-events: none;

    filter:
      drop-shadow(0 0 12px rgba(0,128,255,.52));

    animation:
      erpRegisterFloat 5s ease-in-out infinite;
  }

  .erp-register-art-left {
    left: max(-3%, calc(50% - 770px));
    top: 51%;

    transform: translateY(-40%);
  }

  .erp-register-art-right {
    right: max(-3%, calc(50% - 770px));
    top: 51%;

    transform: translateY(-40%);

    animation-delay: -2s;
  }

  @keyframes erpRegisterFloat {
    0%, 100% {
      translate: 0 0;
    }

    50% {
      translate: 0 -13px;
    }
  }

  /* ============================================
     BOTTOM ARC TOUCHING ACCOUNT BOX
  ============================================ */

  .erp-register-scene .erp-horizon {
    bottom: -325px;

    width: 150vw;
    height: 405px;

    border-top: 3px solid #77e5ff;

    box-shadow:
      0 -4px 10px #35c9ff,
      0 -11px 26px rgba(11,119,255,.8),
      0 -20px 48px rgba(0,88,255,.35),
      inset 0 20px 40px rgba(6,76,214,.28);
  }

  /* ============================================
     LAPTOP / SMALL SCREEN ADJUSTMENTS
  ============================================ */

  @media (max-height: 850px) and (min-width: 1001px) {
    .erp-register-scene {
      padding-top: 8px;
      padding-bottom: 48px;
    }

    .erp-register-scene .erp-auth-brand {
      margin-bottom: 19px;
    }

    .erp-register-panel {
      padding-top: 43px;
      padding-bottom: 20px;
    }

    .erp-register-heading {
      margin-bottom: 11px;
    }

    .erp-register-heading h1 {
      font-size: 37px;
    }

    .erp-register-heading p {
      font-size: 14px;
    }

    .erp-register-panel .erp-field {
      margin-bottom: 8px;
    }

    .erp-register-panel .erp-input-wrap {
      height: 42px;
    }

    .erp-register-submit {
      height: 50px;
      margin-top: 12px;
    }

    .erp-register-login {
      margin-top: 15px;
    }
  }

  @media (max-width: 1250px) {
    .erp-register-art {
      width: 23vw;
    }

    .erp-register-panel {
      width: min(100%, 650px);

      padding-left: 55px;
      padding-right: 55px;
    }
  }

  @media (max-width: 1000px) {
    .erp-register-art {
      opacity: .23;
    }

    .erp-register-panel {
      width: min(100%, 680px);
    }
  }

  @media (max-width: 600px) {
    .erp-register-scene {
      padding: 80px 14px 85px;
    }

    .erp-register-scene .erp-auth-brand {
      margin-bottom: 42px;
    }

    .erp-register-panel {
      padding: 52px 20px 25px;

      border-radius: 27px;
    }

    .erp-register-panel::before {
      border-radius: 27px;
    }

    .erp-register-heading h1 {
      font-size: 30px;
    }

    .erp-register-heading p {
      font-size: 13px;
    }

    .erp-register-panel .erp-field label {
      font-size: 14px;
    }

    .erp-register-art {
      display: none;
    }

    .erp-register-submit {
      font-size: 18px;
    }

    .erp-register-login {
      font-size: 13px;
    }

    .erp-register-scene .erp-horizon {
      bottom: -340px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .erp-register-art {
      animation: none;
    }
  }
`;

/* =========================================================
   SHARED STYLE COMPONENT

   THIS FIXES THE PREVIOUS WHITE BACKGROUND ISSUE
========================================================= */

function AuthStyles({ register = false }) {
  return (
    <style>
      {AUTH_STYLES}
      {register ? "" : LOGIN_GALAXY_STYLES}
      {register ? REGISTER_STYLES : ""}
    </style>
  );
}

/* =========================================================
   SHARED ERP PLANET LOGO
========================================================= */

function ERPPlanetLogo({ register = false }) {
  return (
    <div className="erp-auth-brand">
      <svg
  className="erp-revolving-planet"
  viewBox="0 0 105 80"
  aria-hidden="true"
>
        <defs>
          <radialGradient
            id={register ? "erpRegisterPlanet" : "erpPlanet"}
            cx="35%"
            cy="20%"
          >
            <stop stopColor="#a8f6ff" />
            <stop offset=".4" stopColor="#159ff4" />
            <stop offset="1" stopColor="#0639a9" />
          </radialGradient>
        </defs>

        <circle
          cx="54"
          cy="40"
          r="29"
          fill={
            register
              ? "url(#erpRegisterPlanet)"
              : "url(#erpPlanet)"
          }
        />

        <ellipse
          cx="53"
          cy="41"
          rx="48"
          ry="14"
          transform="rotate(-25 53 41)"
          fill="none"
          stroke="#37c9ff"
          strokeWidth="8"
        />

        <path
          d="M34 19Q52 8 72 24"
          fill="none"
          stroke="#d0faff"
          strokeWidth="2"
          opacity=".5"
        />
      </svg>

      <div>
        <strong>ERP</strong>
        <small>Project Management</small>
      </div>
    </div>
  );
}

/* =========================================================
   EXISTING LOGIN LEFT ILLUSTRATION
========================================================= */

function LaptopIllustration() {
  return (
    <svg
      className="erp-art erp-art-left"
      viewBox="0 0 390 340"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="erpLaptop"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop stopColor="#91a6f5" />
          <stop offset="1" stopColor="#283879" />
        </linearGradient>
      </defs>

      <ellipse
        cx="184"
        cy="278"
        rx="169"
        ry="39"
        fill="none"
        stroke="#acb3f4"
        strokeWidth="3"
        opacity=".9"
      />

      <ellipse
        cx="184"
        cy="278"
        rx="135"
        ry="25"
        fill="none"
        stroke="#acb3f4"
        strokeWidth="2"
      />

      <g transform="rotate(-9 176 180)">
        <rect
          x="53"
          y="87"
          width="246"
          height="158"
          rx="13"
          fill="#111a31"
          stroke="#acb3f4"
          strokeWidth="7"
        />

        <rect
          x="69"
          y="104"
          width="214"
          height="124"
          rx="5"
          fill="#070e1c"
        />

        <path
          d="M93 194l39-32 31 13 49-59 41-12"
          fill="none"
          stroke="#acb3f4"
          strokeWidth="4"
        />

        <path
          d="M237 105l18-2-1 18"
          fill="none"
          stroke="#acb3f4"
          strokeWidth="4"
        />

        <rect
          x="96"
          y="197"
          width="18"
          height="25"
          fill="url(#erpLaptop)"
        />

        <rect
          x="126"
          y="182"
          width="18"
          height="40"
          fill="url(#erpLaptop)"
        />

        <rect
          x="156"
          y="172"
          width="18"
          height="50"
          fill="url(#erpLaptop)"
        />

        <rect
          x="186"
          y="152"
          width="18"
          height="70"
          fill="url(#erpLaptop)"
        />

        <path
          d="M47 248h261l38 25q6 8-8 10H34q-12-3-6-10z"
          fill="url(#erpLaptop)"
          stroke="#acb3f4"
          strokeWidth="3"
        />

        <path
          d="M123 269h100"
          stroke="#acb3f4"
          strokeWidth="3"
        />
      </g>

      <g transform="translate(260 35) rotate(10)">
        <rect
          width="86"
          height="78"
          rx="12"
          fill="#111527"
          stroke="#acb3f4"
          strokeWidth="3"
        />

        <text
          x="13"
          y="52"
          fontSize="37"
          fontWeight="bold"
          fill="#c1f3ff"
        >
          &lt;/&gt;
        </text>
      </g>

      <g transform="translate(300 191)">
        <circle
          r="31"
          fill="#44439b"
          stroke="#acb3f4"
          strokeWidth="6"
        />

        <circle
          r="13"
          fill="#eea25a"
          stroke="#acb3f4"
          strokeWidth="4"
        />

        <path
          d="M-37 0h74M0-37v74M-26-26l52 52M26-26l-52 52"
          stroke="#acb3f4"
          strokeWidth="8"
          strokeDasharray="10 13"
        />
      </g>
    </svg>
  );
}

/* =========================================================
   EXISTING LOGIN RIGHT ILLUSTRATION
========================================================= */

function TargetIllustration() {
  return (
    <svg
      className="erp-art erp-art-right"
      viewBox="0 0 390 340"
      aria-hidden="true"
    >
      <ellipse
        cx="196"
        cy="278"
        rx="171"
        ry="39"
        fill="none"
        stroke="#acb3f4"
        strokeWidth="3"
      />

      <ellipse
        cx="196"
        cy="278"
        rx="135"
        ry="25"
        fill="none"
        stroke="#acb3f4"
        strokeWidth="2"
      />

      <circle
        cx="188"
        cy="178"
        r="91"
        fill="#0b1226"
        stroke="#acb3f4"
        strokeWidth="6"
      />

      <circle
        cx="188"
        cy="178"
        r="68"
        fill="#25234d"
        stroke="#acb3f4"
        strokeWidth="5"
      />

      <circle
        cx="188"
        cy="178"
        r="47"
        fill="#10142b"
        stroke="#acb3f4"
        strokeWidth="6"
      />

      <circle
        cx="188"
        cy="178"
        r="23"
        fill="#6257a1"
        stroke="#acb3f4"
        strokeWidth="5"
      />

      <path
        d="M189 178l95-65"
        stroke="#acb3f4"
        strokeWidth="9"
        strokeLinecap="round"
      />

      <path
        d="M274 119l30-19-4 24-23 14"
        fill="#6ad7ff"
        stroke="#acb3f4"
        strokeWidth="2"
      />

      <g transform="translate(267 22) rotate(8)">
        <rect
          width="87"
          height="73"
          rx="9"
          fill="#111527"
          stroke="#acb3f4"
          strokeWidth="4"
        />

        <path
          d="M12 21h63M12 38h63M12 55h63M26 10v52M48 10v52"
          stroke="#acb3f4"
          strokeWidth="3"
        />
      </g>

      <rect
        x="267"
        y="226"
        width="26"
        height="49"
        rx="3"
        fill="#262b54"
        stroke="#acb3f4"
        strokeWidth="3"
      />

      <rect
        x="300"
        y="206"
        width="26"
        height="69"
        rx="3"
        fill="#3b3569"
        stroke="#acb3f4"
        strokeWidth="3"
      />

      <rect
        x="333"
        y="185"
        width="26"
        height="90"
        rx="3"
        fill="#242847"
        stroke="#acb3f4"
        strokeWidth="3"
      />
    </svg>
  );
}

/* =========================================================
   NEW REGISTER LEFT ILLUSTRATION

   FLOATING TEAM CARD — REFERENCE IMAGE
========================================================= */

function TeamIllustration() {
  return (
    <svg
      className="erp-register-art erp-register-art-left"
      viewBox="0 0 390 340"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="teamCardGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop stopColor="#154b9c" />
          <stop offset=".55" stopColor="#08265b" />
          <stop offset="1" stopColor="#03122e" />
        </linearGradient>

        <linearGradient
          id="teamPersonGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop stopColor="#7deaff" />
          <stop offset=".5" stopColor="#258fff" />
          <stop offset="1" stopColor="#0641bb" />
        </linearGradient>

        <filter
          id="teamGlow"
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
        >
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* GLOWING ORBITAL PLATFORM */}

      <ellipse
        cx="195"
        cy="271"
        rx="176"
        ry="41"
        fill="none"
        stroke="#087bff"
        strokeWidth="13"
        opacity=".25"
        filter="url(#teamGlow)"
      />

      <ellipse
        cx="195"
        cy="271"
        rx="176"
        ry="41"
        fill="none"
        stroke="#24c8ff"
        strokeWidth="3"
      />

      <ellipse
        cx="195"
        cy="271"
        rx="138"
        ry="24"
        fill="none"
        stroke="#126bff"
        strokeWidth="1.5"
        opacity=".55"
      />

      {/* CARD SHADOW */}

      <g transform="rotate(-13 195 169)">
        <rect
          x="69"
          y="68"
          width="253"
          height="186"
          rx="19"
          fill="#0b7cff"
          opacity=".28"
          filter="url(#teamGlow)"
        />

        {/* FLOATING CARD */}

        <rect
          x="69"
          y="68"
          width="253"
          height="186"
          rx="19"
          fill="url(#teamCardGradient)"
          stroke="#58d8ff"
          strokeWidth="3"
        />

        <path
          d="M85 86h219"
          stroke="#7ddfff"
          strokeWidth="2"
          opacity=".28"
        />

        {/* LEFT PERSON */}

        <circle
          cx="143"
          cy="144"
          r="18"
          fill="url(#teamPersonGradient)"
          stroke="#9eefff"
          strokeWidth="1.5"
        />

        <path
          d="M108 212c0-25 14-42 35-42s35 17 35 42v8h-70z"
          fill="url(#teamPersonGradient)"
          stroke="#78dfff"
          strokeWidth="1.5"
        />

        {/* RIGHT PERSON */}

        <circle
          cx="250"
          cy="144"
          r="18"
          fill="url(#teamPersonGradient)"
          stroke="#9eefff"
          strokeWidth="1.5"
        />

        <path
          d="M215 212c0-25 14-42 35-42s35 17 35 42v8h-70z"
          fill="url(#teamPersonGradient)"
          stroke="#78dfff"
          strokeWidth="1.5"
        />

        {/* CENTER PERSON */}

        <circle
          cx="196"
          cy="129"
          r="25"
          fill="url(#teamPersonGradient)"
          stroke="#a6f3ff"
          strokeWidth="2"
        />

        <path
          d="M151 223c0-34 18-54 45-54s45 20 45 54v11h-90z"
          fill="url(#teamPersonGradient)"
          stroke="#9eeeff"
          strokeWidth="2"
        />

        {/* HIGHLIGHT */}

        <path
          d="M87 95q3-11 14-11h181"
          fill="none"
          stroke="#d1faff"
          strokeWidth="2"
          opacity=".35"
        />
      </g>

      {/* BACKGROUND ORBIT */}

      <path
        d="M300 155c35 7 54 23 50 41"
        fill="none"
        stroke="#1388ff"
        strokeWidth="2"
        opacity=".55"
      />
    </svg>
  );
}

/* =========================================================
   NEW REGISTER RIGHT ILLUSTRATION

   FLOATING CHECKLIST — REFERENCE IMAGE
========================================================= */

function ChecklistIllustration() {
  return (
    <svg
      className="erp-register-art erp-register-art-right"
      viewBox="0 0 390 340"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="checkBoardGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop stopColor="#1755a5" />
          <stop offset=".5" stopColor="#0a2e68" />
          <stop offset="1" stopColor="#041632" />
        </linearGradient>

        <linearGradient
          id="checkBadgeGradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop stopColor="#70e7ff" />
          <stop offset=".45" stopColor="#167fff" />
          <stop offset="1" stopColor="#063db8" />
        </linearGradient>

        <filter
          id="checkGlow"
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
        >
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* GLOWING ORBITAL PLATFORM */}

      <ellipse
        cx="190"
        cy="271"
        rx="177"
        ry="41"
        fill="none"
        stroke="#087bff"
        strokeWidth="13"
        opacity=".25"
        filter="url(#checkGlow)"
      />

      <ellipse
        cx="190"
        cy="271"
        rx="177"
        ry="41"
        fill="none"
        stroke="#24c8ff"
        strokeWidth="3"
      />

      <ellipse
        cx="190"
        cy="271"
        rx="138"
        ry="24"
        fill="none"
        stroke="#126bff"
        strokeWidth="1.5"
        opacity=".55"
      />

      {/* CLIPBOARD */}

      <g transform="rotate(12 189 164)">
        <rect
          x="93"
          y="53"
          width="205"
          height="212"
          rx="20"
          fill="#0a78ff"
          opacity=".25"
          filter="url(#checkGlow)"
        />

        <rect
          x="93"
          y="53"
          width="205"
          height="212"
          rx="20"
          fill="url(#checkBoardGradient)"
          stroke="#64d9ff"
          strokeWidth="3"
        />

        {/* TOP CLIP */}

        <rect
          x="160"
          y="39"
          width="72"
          height="31"
          rx="9"
          fill="url(#checkBadgeGradient)"
          stroke="#a6efff"
          strokeWidth="2"
        />

        <circle
          cx="196"
          cy="43"
          r="7"
          fill="#071b44"
          stroke="#c6f7ff"
          strokeWidth="2"
        />

        {/* CHECK 1 */}

        <rect
          x="117"
          y="100"
          width="31"
          height="30"
          rx="4"
          fill="#0b2857"
          stroke="#79ddff"
          strokeWidth="2"
        />

        <path
          d="M124 115l8 8 17-21"
          fill="none"
          stroke="#b7f5ff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M164 108h90M164 122h66"
          stroke="#377cce"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* CHECK 2 */}

        <rect
          x="117"
          y="155"
          width="31"
          height="30"
          rx="4"
          fill="#0b2857"
          stroke="#79ddff"
          strokeWidth="2"
        />

        <path
          d="M124 170l8 8 17-21"
          fill="none"
          stroke="#b7f5ff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M164 163h90M164 177h66"
          stroke="#377cce"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* CHECK 3 */}

        <rect
          x="117"
          y="210"
          width="31"
          height="30"
          rx="4"
          fill="#0b2857"
          stroke="#79ddff"
          strokeWidth="2"
        />

        <path
          d="M124 225l8 8 17-21"
          fill="none"
          stroke="#b7f5ff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M164 218h90M164 232h66"
          stroke="#377cce"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* FLOATING CHECKMARK BADGE */}

      <circle
        cx="302"
        cy="235"
        r="37"
        fill="#0c83ff"
        opacity=".35"
        filter="url(#checkGlow)"
      />

      <circle
        cx="302"
        cy="235"
        r="34"
        fill="url(#checkBadgeGradient)"
        stroke="#83e7ff"
        strokeWidth="3"
      />

      <path
        d="M285 235l12 12 23-27"
        fill="none"
        stroke="#e3ffff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   SHARED EMAIL ICON — REGISTER ONLY
========================================================= */

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
      />

      <path d="M3 6l9 7 9-7" />
    </svg>
  );
}

/* =========================================================
   SHARED PASSWORD EYE ICON
========================================================= */

function EyeIcon({ visible }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />

      <circle cx="12" cy="12" r="3" />

      {!visible && (
        <path d="M3 3l18 18" />
      )}
    </svg>
  );
}

/* =========================================================
   PAGE 2: LOGIN PAGE

   EXISTING AUTHENTICATION FUNCTIONALITY UNCHANGED
========================================================= */

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
    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    let createdScript = false;
    const initializeGoogle = () => {
      if (!window.google?.accounts?.oauth2) {
        setMessage("Google sign-in could not be initialized. Please refresh the page.");
        return;
      }
      googleTokenClient.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: async googleResponse => {
          if (googleResponse.error || !googleResponse.access_token) {
            setMessage("Google sign-in was cancelled or could not be completed.");
            return;
          }
          setMessage("");
          setIsLoggingIn(true);
          try {
            const response = await fetch(`${API_URL}/api/auth/google`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                accessToken: googleResponse.access_token
              })
            });
            const data = await response.json();
            if (!response.ok) {
              setMessage(data.message || "Google login failed.");
              return;
            }
            saveLogin(data, rememberMe, navigate);
          } catch (error) {
            console.error("Google login error:", error);
            setMessage("Unable to connect to the backend.");
          } finally {
            setIsLoggingIn(false);
          }
        },
        error_callback: error => {
          console.error("Google popup error:", error);
          setMessage("Google account selection was cancelled or blocked.");
        }
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
      setMessage("Google sign-in could not be loaded. Please refresh the page.");
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
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Invalid email or password");
        return;
      }
      saveLogin(data, rememberMe, navigate);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to the backend.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  // Open Google's account chooser.
  function handleGoogleLogin() {
    setMessage("");
    if (!googleTokenClient.current) {
      setMessage("Google sign-in is loading. Please try again in a moment.");
      return;
    }
    googleTokenClient.current.requestAccessToken({
      prompt: "select_account"
    });
  }

  return (
    <main className="erp-auth-scene">

      <AuthStyles />

      {/* MOVING STARS */}

      <div
        className="erp-stars"
        aria-hidden="true"
      />

      {/* ROTATING BLUE LIGHT */}

      <div
        className="erp-rays"
        aria-hidden="true"
      />

      {/* HOME LINK */}

      <Link
        to="/"
        className="erp-auth-home"
      >
        ← Home
      </Link>

      {/* ERP LOGO */}

      <ERPPlanetLogo />

      {/* LOGIN STAGE */}

      <div className="erp-login-stage">

        {/* EXISTING LEFT ILLUSTRATION */}

        <LaptopIllustration />

        {/* EXISTING RIGHT ILLUSTRATION */}

        <TargetIllustration />

        {/* LOGIN BOX */}

        <section className="erp-login-panel">

          <div
            className="erp-avatar"
            aria-hidden="true"
          >
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="15" r="9" />

              <path d="M7 43v-4c0-10 7-15 17-15s17 5 17 15v4z" />
            </svg>
          </div>

          <div className="erp-login-title">
            <h1>
              Welcome <span>Back!</span>
            </h1>

            <p>Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin}>

            {/* EMAIL */}

            <div className="erp-field">
              <label htmlFor="email">
                Email or Roll Number
              </label>

              <div className="erp-input-wrap">
                <UserIcon />

                <input id="email" type="email" name="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Enter your email" autoComplete="username" required />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="erp-field">
              <label htmlFor="password">
                Password
              </label>

              <div className="erp-input-wrap">
                <LockIcon />

                <input id="password" type={showPassword ? "text" : "password"} name="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required />

                <button
                  type="button"
                  className="erp-eye"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}

            <div className="erp-login-actions">

              <label className="erp-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />

                Remember me
              </label>

              <button
                type="button"
                className="erp-forgot"
                onClick={() =>
                  setMessage(
                    "Password recovery is not configured yet."
                  )
                }
              >
                Forgot Password?
              </button>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="erp-submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Signing in..." : "Login"}

              <span aria-hidden="true">→</span>
            </button>
          </form>

          {/* GOOGLE LOGIN */}

          <div className="erp-or">
            OR
          </div>

          <button
            type="button"
            className="erp-google"
            disabled={isLoggingIn}
            onClick={handleGoogleLogin}
          >
            <span className="erp-google-g">
              G
            </span>

            Continue with Google
          </button>

          {/* SIGNUP LINK */}

          <div className="erp-signup">
            Don't have an account?

            <Link to="/register">
              Sign Up
            </Link>
          </div>

          {/* MESSAGE */}

          {message && (
            <p
              className="erp-auth-message"
              role="status"
            >
              {message}
            </p>)}
        </section>
      </div>

      {/* BOTTOM BLUE ARC */}

      <div
        className="erp-horizon"
        aria-hidden="true"
      />
    </main>
  );
}

/* =========================================================
   PAGE 3: CREATE ACCOUNT

   NEW DESIGN MATCHING YOUR REFERENCE IMAGE

   REGISTRATION FUNCTIONALITY UNCHANGED
========================================================= */

function RegisterPage() {
  const [name, setName] = useState("");
  const [usn, setUsn] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [message, setMessage] = useState("");

  const [
    isRegistering,
    setIsRegistering,
  ] = useState(false);

  const navigate = useNavigate();

  /* ============================================
     EXISTING REGISTRATION API
  ============================================ */

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("");
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setMessage(
        "Password must contain at least 8 characters."
      );
      return;
    }
    setIsRegistering(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          usn: usn.trim().toUpperCase(),
          email: email.trim(),
          password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(
          data.message || "Registration failed."
        );
        return;
      }

      saveLogin(data, true, navigate);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Unable to connect to the backend. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  }

  /* ============================================
     CREATE ACCOUNT PAGE
  ============================================ */

  return (
    <main className="erp-auth-scene erp-register-scene">

      {/* SHARED LOGIN STYLES + REGISTER STYLES */}

      <AuthStyles register />

      {/* MOVING STARS */}

      <div
        className="erp-stars"
        aria-hidden="true"
      />

      {/* SAME ROTATING BLUE LIGHT */}

      <div
        className="erp-rays"
        aria-hidden="true"
      />

      {/* HOME LINK */}

      <Link
        to="/"
        className="erp-auth-home"
      >
        ← Home
      </Link>

      {/* SAME ERP PLANET LOGO */}

      <ERPPlanetLogo register />

      {/* CREATE ACCOUNT STAGE */}

      <div className="erp-register-stage">

        {/* LEFT FLOATING TEAM CARD */}

        <TeamIllustration />

        {/* RIGHT FLOATING CHECKLIST */}

        <ChecklistIllustration />

        {/* MAIN ACCOUNT BOX */}

        <section className="erp-register-panel">

          {/* TOP USER PLUS ICON */}

          <div
            className="erp-register-avatar"
            aria-hidden="true"
          >
            <svg viewBox="0 0 48 48">
              <circle cx="20" cy="14" r="8" />

              <path d="M5 40v-3c0-9 6-14 15-14 5 0 9 1 12 4" />

              <path d="M38 27v15" />

              <path d="M30.5 34.5h15" />
            </svg>
          </div>

          {/* HEADING */}

          <div className="erp-register-heading">
            <h1>
              Create your account
            </h1>

            <p>
              Join ERP and manage your projects,
              team, and progress
              <br />
              in one powerful platform.
            </p>
          </div>

          {/* FORM */}

          <form onSubmit={handleRegister}>

            {/* FULL NAME */}

            <div className="erp-field">
              <label htmlFor="registerName">
                Full Name
              </label>

              <div className="erp-input-wrap">
                <UserIcon />

                <input id="registerName" type="text" value={name} onChange={event => setName(event.target.value)} placeholder="Enter your full name" autoComplete="name" required />
              </div>
            </div>

            {/* USN */}

            <div className="erp-field">
              <label htmlFor="registerUsn">
                USN
              </label>

              <div className="erp-input-wrap">
                <UserIcon />

                <input id="registerUsn" type="text" value={usn} onChange={event => setUsn(event.target.value.toUpperCase())} placeholder="Enter your USN" autoComplete="off" required />
              </div>
            </div>

            {/* EMAIL ADDRESS */}

            <div className="erp-field">
              <label htmlFor="registerEmail">
                Email Address
              </label>

              <div className="erp-input-wrap">
                <EmailIcon />

                <input id="registerEmail" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Enter your email" autoComplete="email" required />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="erp-field">
              <label htmlFor="registerPassword">
                Password
              </label>

              <div className="erp-input-wrap">
                <LockIcon />

                <input
                  id="registerPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
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
                  className="erp-eye"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    visible={showPassword}
                  />
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="erp-field">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="erp-input-wrap">
                <LockIcon />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="erp-eye"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <EyeIcon
                    visible={showConfirmPassword}
                  />
                </button>
              </div>
            </div>

            {/* CREATE ACCOUNT BUTTON */}

            <button
              type="submit"
              className="erp-register-submit"
              disabled={isRegistering}
            >
              {isRegistering
                ? "Creating account..."
                : "Create Account"}

              <span aria-hidden="true">
                →
              </span>
            </button>
          </form>

          {/* ERROR / STATUS MESSAGE */}

          {message && (
            <p
              className="erp-auth-message"
              role="alert"
            >
              {message}
            </p>)}

          {/* LOGIN LINK */}

          <div className="erp-register-login">
            Already have an account?

            <Link to="/login">
              Login
            </Link>
          </div>
        </section>
      </div>

      {/* BOTTOM GLOWING BLUE ARC */}

      <div
        className="erp-horizon"
        aria-hidden="true"
      />
    </main>
  );
}
function RoleDashboard() {
  let storedUser;

  try {
    storedUser = JSON.parse(
      localStorage.getItem("user") ||
      sessionStorage.getItem("user") ||
      "null"
    );
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (storedUser?.role === "HOD") return <HODDashboard />;
  if (storedUser?.role === "PROJECT_LEAD") return <Navigate to="/project-lead/dashboard" replace />;
  if (!storedUser) return <Navigate to="/login" replace />;
  return <Dashboard />;
}
/* -------------------------------------------------------
   APP ROUTES
------------------------------------------------------- */

export default function App() {
  return (
    <Routes>
      {/* HOME PAGE */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<RoleDashboard />} />
      <Route path="/project-lead/welcome" element={<ProjectLeadCover />} />
      <Route path="/project-lead" element={<ProjectLeadLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ProjectLeadDashboard />} />
        <Route path="projects" element={<ProjectLeadProjects />} />
        <Route path="profile" element={<ProjectLeadProfile />} />
        <Route path="create-project" element={<CreateProject />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
