import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COLS = 150;
const ROWS = 70;
const WIDTH = 15;
const HEIGHT = 7;
const SPHERE_RADIUS = 2.1;
const TILT = -0.55;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uMouse;
  uniform float uPixelRatio;
  uniform float uSize;

  attribute vec3 aSphere;
  attribute float aRand;

  varying float vAccent;
  varying float vLift;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.z += sin(p.x * 0.55 + uTime * 0.55) * 0.32 + cos(p.y * 0.8 + uTime * 0.35) * 0.22;

    float lift = smoothstep(1.8, 0.0, distance(p.xy, uMouse));
    p.z += lift * 0.85;

    float a = uTime * 0.12;
    vec3 s = aSphere;
    s = vec3(s.x * cos(a) - s.z * sin(a), s.y, s.x * sin(a) + s.z * cos(a));

    float t = smoothstep(0.0, 1.0, uProgress);
    vec3 pos = mix(p, s, t);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 + lift * 1.4) * (0.6 + aRand * 0.7) / -mv.z;

    vAccent = step(0.972, aRand);
    vLift = lift * (1.0 - t);
    vAlpha = 0.28 + lift * 0.6;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;

  varying float vAccent;
  varying float vLift;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.15, d) * vAlpha;
    vec3 color = mix(uColor, uAccent, max(vAccent, vLift * 0.7));
    gl_FragColor = vec4(color, alpha + vAccent * 0.35);
  }
`;

function buildGeometry() {
  const count = COLS * ROWS;
  const grid = new Float32Array(count * 3);
  const sphere = new Float32Array(count * 3);
  const rand = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const c = i % COLS;
    const r = Math.floor(i / COLS);
    grid[i * 3] = (c / (COLS - 1) - 0.5) * WIDTH;
    grid[i * 3 + 1] = (r / (ROWS - 1) - 0.5) * HEIGHT;
    grid[i * 3 + 2] = 0;

    // Distribuição de Fibonacci: pontos uniformes na esfera
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    sphere[i * 3] = Math.cos(theta) * radius * SPHERE_RADIUS;
    sphere[i * 3 + 1] = y * SPHERE_RADIUS;
    sphere[i * 3 + 2] = Math.sin(theta) * radius * SPHERE_RADIUS;

    rand[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(grid, 3));
  geometry.setAttribute("aSphere", new THREE.BufferAttribute(sphere, 3));
  geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
  return geometry;
}

function Field({ progressRef, reducedMotion }) {
  const materialRef = useRef(null);
  const groupRef = useRef(null);
  const { viewport, gl } = useThree();
  const geometry = useMemo(buildGeometry, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uPixelRatio: { value: gl.getPixelRatio() },
      uSize: { value: 26 },
      uColor: { value: new THREE.Color("#9A9AA6") },
      uAccent: { value: new THREE.Color("#C6F432") },
    }),
    [gl]
  );

  useFrame((state, delta) => {
    const u = uniforms;
    if (!reducedMotion) u.uTime.value += delta;
    // Em telas estreitas os pontos ficam menores para não brigar com o texto
    u.uSize.value = viewport.width < 5 ? 15 : 26;

    // Converte o ponteiro para coordenadas locais do plano inclinado
    const tx = (state.pointer.x * viewport.width) / 2;
    const ty = (state.pointer.y * viewport.height) / 2 / Math.cos(TILT);
    u.uMouse.value.x += (tx - u.uMouse.value.x) * 0.08;
    u.uMouse.value.y += (ty - u.uMouse.value.y) * 0.08;

    const target = progressRef.current ?? 0;
    u.uProgress.value += (target - u.uProgress.value) * 0.06;

    if (groupRef.current) {
      const p = u.uProgress.value;
      groupRef.current.rotation.x = TILT * (1 - p);
      groupRef.current.position.y = -0.6 * (1 - p) + 0.9 * p;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function ParticleField({ progressRef, className }) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <Field progressRef={progressRef} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
