import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  RoundedBox,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";

/* ==========================================
   MATERIAL COLORS
========================================== */

const COLORS = {
  suit: "#9284ed",
  suitLight: "#c7bcff",
  suitDark: "#50449f",
  helmet: "#aaa0ff",
  visor: "#03071c",
  purple: "#7560ff",
  blue: "#708aff",
  rock: "#17132d",
  rockLight: "#302456",
};

/* ==========================================
   REUSABLE 3D SHAPES
========================================== */

function Sphere({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  color = COLORS.suit,
  metalness = 0.25,
  roughness = 0.35,
  emissive = "#000000",
  emissiveIntensity = 0,
}) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <sphereGeometry args={[1, 32, 24]} />

      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

/* ==========================================
   CYLINDER BETWEEN TWO POINTS
========================================== */

function Limb({
  start,
  end,
  radius = 0.12,
  color = COLORS.suit,
}) {
  const startVector = new THREE.Vector3(...start);
  const endVector = new THREE.Vector3(...end);

  const direction = new THREE.Vector3().subVectors(
    endVector,
    startVector
  );

  const midpoint = new THREE.Vector3()
    .addVectors(startVector, endVector)
    .multiplyScalar(0.5);

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  return (
    <group>
      <mesh
        position={midpoint.toArray()}
        quaternion={quaternion}
        castShadow
      >
        <cylinderGeometry
          args={[radius, radius * 1.08, direction.length(), 16]}
        />

        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.35}
        />
      </mesh>

      <Sphere
        position={start}
        scale={[radius, radius, radius]}
        color={color}
      />

      <Sphere
        position={end}
        scale={[radius, radius, radius]}
        color={color}
      />
    </group>
  );
}

/* ==========================================
   ROCK PLATFORM
========================================== */

function Rock() {
  return (
    <group position={[0, -1.12, 0]}>

      {/* MAIN ROCK */}

      <mesh
        position={[-0.15, 0.1, 0]}
        scale={[1.4, 0.48, 0.9]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 1]} />

        <meshStandardMaterial
          color={COLORS.rock}
          roughness={0.9}
          metalness={0.1}
          flatShading
        />
      </mesh>

      {/* LEFT ROCK */}

      <mesh
        position={[-0.9, -0.12, 0.1]}
        scale={[0.65, 0.3, 0.6]}
        rotation={[0.1, 0.3, 0.2]}
        castShadow
      >
        <dodecahedronGeometry args={[1, 0]} />

        <meshStandardMaterial
          color={COLORS.rockLight}
          roughness={0.9}
          flatShading
        />
      </mesh>

      {/* RIGHT ROCK */}

      <mesh
        position={[0.8, -0.16, 0]}
        scale={[0.65, 0.3, 0.55]}
        rotation={[0.2, 0.4, -0.1]}
        castShadow
      >
        <dodecahedronGeometry args={[1, 0]} />

        <meshStandardMaterial
          color="#211943"
          roughness={0.9}
          flatShading
        />
      </mesh>

      {/* PURPLE LIGHT UNDER ROCK */}

      <mesh
        position={[0, -0.25, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.65, 64]} />

        <meshBasicMaterial
          color="#4931ff"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

    </group>
  );
}

/* ==========================================
   ASTRONAUT HELMET
========================================== */

function Helmet() {
  return (
    <group position={[0, 1.13, 0]} rotation={[0, -0.12, -0.08]}>

      {/* OUTER HELMET */}

      <Sphere
        scale={[0.49, 0.51, 0.47]}
        color={COLORS.helmet}
        metalness={0.5}
        roughness={0.22}
      />

      {/* HELMET INNER RING */}

      <Sphere
        position={[0, 0, 0.29]}
        scale={[0.41, 0.41, 0.2]}
        color="#5d51c8"
        metalness={0.6}
      />

      {/* BLACK VISOR */}

      <mesh position={[0, 0.015, 0.397]}>
        <sphereGeometry
          args={[
            0.375,
            48,
            32,
            0,
            Math.PI * 2,
            0,
            Math.PI,
          ]}
        />

        <meshPhysicalMaterial
          color={COLORS.visor}
          metalness={0.75}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* VISOR HIGHLIGHT */}

      <Sphere
        position={[-0.13, 0.18, 0.72]}
        scale={[0.065, 0.13, 0.018]}
        color="#7b8cff"
        emissive="#6a75ff"
        emissiveIntensity={0.7}
      />

      {/* LEFT EAR */}

      <Sphere
        position={[-0.47, -0.02, 0]}
        scale={[0.12, 0.18, 0.16]}
        color={COLORS.suitLight}
      />

      {/* RIGHT EAR */}

      <Sphere
        position={[0.47, -0.02, 0]}
        scale={[0.12, 0.18, 0.16]}
        color={COLORS.suitLight}
      />

      {/* HELMET NECK */}

      <mesh position={[0, -0.48, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.13, 32]} />

        <meshStandardMaterial
          color="#c6bbff"
          metalness={0.45}
          roughness={0.3}
        />
      </mesh>

    </group>
  );
}

/* ==========================================
   ASTRONAUT BODY
========================================== */

function AstronautBody() {
  return (
    <group>

      {/* MAIN TORSO */}

      <Sphere
        position={[0, 0.34, 0]}
        scale={[0.43, 0.58, 0.32]}
        color={COLORS.suit}
      />

      {/* CHEST PANEL */}

      <RoundedBox
        args={[0.34, 0.24, 0.055]}
        radius={0.045}
        smoothness={4}
        position={[0, 0.43, 0.32]}
      >
        <meshStandardMaterial
          color="#c3baff"
          metalness={0.4}
          roughness={0.3}
        />
      </RoundedBox>

      {/* CHEST LIGHT */}

      <Sphere
        position={[0, 0.45, 0.36]}
        scale={[0.065, 0.065, 0.025]}
        color="#7b6bff"
        emissive="#6655ff"
        emissiveIntensity={1.5}
      />

      {/* BACKPACK */}

      <RoundedBox
        args={[0.65, 0.75, 0.28]}
        radius={0.13}
        smoothness={4}
        position={[0, 0.32, -0.28]}
      >
        <meshStandardMaterial
          color="#6255c5"
          metalness={0.35}
          roughness={0.4}
        />
      </RoundedBox>

      {/* WAIST */}

      <Sphere
        position={[0, -0.2, 0]}
        scale={[0.39, 0.25, 0.32]}
        color={COLORS.suitDark}
      />

    </group>
  );
}

/* ==========================================
   ASTRONAUT ARMS
========================================== */

function AstronautArms() {
  return (
    <group>

      {/* LEFT ARM */}

      <Limb
        start={[-0.37, 0.62, 0]}
        end={[-0.55, 0.12, 0.2]}
        radius={0.14}
        color={COLORS.suit}
      />

      <Limb
        start={[-0.55, 0.12, 0.2]}
        end={[-0.18, -0.08, 0.5]}
        radius={0.12}
        color={COLORS.suitLight}
      />

      {/* LEFT GLOVE */}

      <Sphere
        position={[-0.18, -0.08, 0.5]}
        scale={[0.14, 0.12, 0.14]}
        color="#d0c8ff"
      />

      {/* RIGHT ARM */}

      <Limb
        start={[0.37, 0.62, 0]}
        end={[0.56, 0.12, 0.15]}
        radius={0.14}
        color={COLORS.suit}
      />

      <Limb
        start={[0.56, 0.12, 0.15]}
        end={[0.23, -0.08, 0.5]}
        radius={0.12}
        color={COLORS.suitLight}
      />

      {/* RIGHT GLOVE */}

      <Sphere
        position={[0.23, -0.08, 0.5]}
        scale={[0.14, 0.12, 0.14]}
        color="#d0c8ff"
      />

    </group>
  );
}

/* ==========================================
   ASTRONAUT LEGS - SITTING POSITION
========================================== */

function AstronautLegs() {
  return (
    <group>

      {/* LEFT THIGH */}

      <Limb
        start={[-0.2, -0.25, 0]}
        end={[-0.34, -0.55, 0.48]}
        radius={0.19}
        color={COLORS.suit}
      />

      {/* LEFT LOWER LEG */}

      <Limb
        start={[-0.34, -0.55, 0.48]}
        end={[-0.38, -1.12, 0.55]}
        radius={0.16}
        color={COLORS.suitLight}
      />

      {/* LEFT BOOT */}

      <Sphere
        position={[-0.38, -1.16, 0.7]}
        scale={[0.2, 0.15, 0.34]}
        color="#a99cff"
      />

      {/* RIGHT THIGH */}

      <Limb
        start={[0.2, -0.25, 0]}
        end={[0.35, -0.55, 0.48]}
        radius={0.19}
        color={COLORS.suit}
      />

      {/* RIGHT LOWER LEG */}

      <Limb
        start={[0.35, -0.55, 0.48]}
        end={[0.4, -1.12, 0.55]}
        radius={0.16}
        color={COLORS.suitLight}
      />

      {/* RIGHT BOOT */}

      <Sphere
        position={[0.4, -1.16, 0.7]}
        scale={[0.2, 0.15, 0.34]}
        color="#a99cff"
      />

    </group>
  );
}

/* ==========================================
   3D LAPTOP
========================================== */

function Laptop() {
  const screenLight = useRef();

  useFrame(({ clock }) => {
    if (screenLight.current) {
      screenLight.current.intensity =
        1.2 + Math.sin(clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group
      position={[0, -0.05, 0.55]}
      rotation={[-0.12, 0, 0]}
    >

      {/* KEYBOARD BASE */}

      <RoundedBox
        args={[0.85, 0.045, 0.55]}
        radius={0.025}
        smoothness={4}
        position={[0, 0, 0.12]}
      >
        <meshStandardMaterial
          color="#4d43a6"
          metalness={0.75}
          roughness={0.25}
        />
      </RoundedBox>

      {/* LAPTOP SCREEN BACK */}

      <RoundedBox
        args={[0.85, 0.58, 0.045]}
        radius={0.035}
        smoothness={4}
        position={[0, 0.3, -0.14]}
        rotation={[-0.2, 0, 0]}
      >
        <meshStandardMaterial
          color="#7262e9"
          metalness={0.7}
          roughness={0.2}
        />
      </RoundedBox>

      {/* GLOWING LAPTOP LOGO */}

      <Sphere
        position={[0, 0.34, -0.18]}
        scale={[0.07, 0.07, 0.015]}
        color="#d7d1ff"
        emissive="#a89aff"
        emissiveIntensity={2}
      />

      {/* LAPTOP LIGHT */}

      <pointLight
        ref={screenLight}
        position={[0, 0.3, 0.3]}
        color="#7565ff"
        intensity={1.2}
        distance={2}
      />

    </group>
  );
}

/* ==========================================
   COMPLETE ASTRONAUT
========================================== */

function AstronautModel() {
  const astronautRef = useRef();

  useFrame(({ clock }) => {
    if (!astronautRef.current) return;

    const time = clock.elapsedTime;

    astronautRef.current.rotation.y =
      Math.sin(time * 0.5) * 0.045;

    astronautRef.current.rotation.z =
      Math.sin(time * 0.7) * 0.015;
  });

  return (
    <group ref={astronautRef}>

      <AstronautBody />

      <Helmet />

      <AstronautArms />

      <AstronautLegs />

      <Laptop />

    </group>
  );
}

/* ==========================================
   COMPLETE 3D SCENE
========================================== */

function AstronautScene() {
  return (
    <>

      {/* AMBIENT LIGHT */}

      <ambientLight intensity={0.8} />

      {/* MAIN PURPLE LIGHT */}

      <pointLight
        position={[-2, 3, 3]}
        intensity={35}
        distance={8}
        color="#7864ff"
      />

      {/* BLUE RIM LIGHT */}

      <pointLight
        position={[2, 2, -2]}
        intensity={25}
        distance={7}
        color="#405cff"
      />

      {/* WHITE HIGHLIGHT */}

      <directionalLight
        position={[-3, 5, 5]}
        intensity={2.5}
        color="#e6e1ff"
        castShadow
      />

      {/* ROCK */}

      <Rock />

      {/* ASTRONAUT */}

      <Float
        speed={1.2}
        rotationIntensity={0.025}
        floatIntensity={0.045}
        floatingRange={[-0.015, 0.015]}
      >
        
        <AstronautModel />
      </Float>
      

      {/* SOFT SHADOW */}

      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.45}
        scale={4}
        blur={2.5}
        far={2}
        color="#4730b5"
      />

    </>
  );
}

/* ==========================================
   MAIN EXPORTED COMPONENT
========================================== */

export default function Astronaut3D() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "220px",
        position: "relative",
        background: "transparent",
      }}
    >
      <Canvas
        camera={{
          position: [3.2, 1.8, 5.5],
          fov: 38,
          near: 0.1,
          far: 100,
        }}
        shadows
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      >
        <Suspense fallback={null}>
          <AstronautScene />
        </Suspense>
      </Canvas>
    </div>
  );
}