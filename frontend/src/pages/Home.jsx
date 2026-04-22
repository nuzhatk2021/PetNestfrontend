import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Spotlight } from "../components/Spotlight";
import Navbar from "../components/Navbar";
import { useRive } from "@rive-app/react-canvas";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import PetOrbit from "../components/PetOrbit";

import * as THREE from "three";
import { useRef, useMemo } from "react";

const ShaderMesh = ({ source, uniforms }) => {
  const { size } = useThree();
  const ref = useRef(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.material.uniforms.u_time.value = clock.getElapsedTime();
  });
  const getUniforms = () => {
    const prepared = {};
    for (const name in uniforms) {
      const u = uniforms[name];
      if (u.type === "uniform1f") prepared[name] = { value: u.value };
      else if (u.type === "uniform1i") prepared[name] = { value: u.value };
      else if (u.type === "uniform1fv") prepared[name] = { value: u.value };
      else if (u.type === "uniform3fv") prepared[name] = { value: u.value.map(v => new THREE.Vector3().fromArray(v)) };
    }
    prepared["u_time"] = { value: 0 };
    prepared["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return prepared;
  };
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `precision mediump float; uniform vec2 u_resolution; out vec2 fragCoord; void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution; fragCoord.y = u_resolution.y - fragCoord.y; }`,
    fragmentShader: source,
    uniforms: getUniforms(),
    glslVersion: THREE.GLSL3,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneFactor,
  }), [size.width, size.height, source]);
  return <mesh ref={ref}><planeGeometry args={[2, 2]} /><primitive object={material} attach="material" /></mesh>;
};

const HomeBackground = () => {
  const uniforms = useMemo(() => ({
    u_colors: { value: [[232/255, 197/255, 71/255], [232/255, 197/255, 71/255], [232/255, 197/255, 71/255], [1, 1, 1], [1, 1, 1], [1, 1, 1]], type: "uniform3fv" },
    u_opacities: { value: [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1], type: "uniform1fv" },
    u_total_size: { value: 20, type: "uniform1f" },
    u_dot_size: { value: 3, type: "uniform1f" },
    u_reverse: { value: 0, type: "uniform1i" },
  }), []);

  const source = `
    precision mediump float;
    in vec2 fragCoord;
    uniform float u_time;
    uniform float u_opacities[10];
    uniform vec3 u_colors[6];
    uniform float u_total_size;
    uniform float u_dot_size;
    uniform vec2 u_resolution;
    uniform int u_reverse;
    out vec4 fragColor;
    float PHI = 1.61803398874989484820459;
    float random(vec2 xy) { return fract(tan(distance(xy*PHI,xy)*0.5)*xy.x); }
    void main() {
      vec2 st = fragCoord.xy;
      st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
      st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));
      float opacity = step(0.0, st.x) * step(0.0, st.y);
      vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
      float show_offset = random(st2);
      float rand = random(st2 * floor((u_time / 5.0) + show_offset + 5.0));
      opacity *= u_opacities[int(rand * 10.0)];
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
      opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
      vec3 color = u_colors[int(show_offset * 6.0)];
      float offset_in = distance(u_resolution/2.0/u_total_size, st2) * 0.01 + random(st2) * 0.15;
      opacity *= step(offset_in, u_time * 0.5);
      fragColor = vec4(color, opacity);
      fragColor.rgb *= fragColor.a;
    }
  `;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <ShaderMesh source={source} uniforms={uniforms} />
      </Canvas>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(0,0,0,0.88) 0%, transparent 100%)" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to bottom, #0A0A0A, transparent)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, #0A0A0A, transparent)" }} />
    </div>
  );
};

function CuteCat() {
  const { RiveComponent } = useRive({
    src: "/src/assets/21546-40484-cute-cat.riv",
    autoplay: true,
  });

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: "420px",
        height: "420px",
        borderRadius: "24px",
        overflow: "hidden",
      }}>
        <RiveComponent style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ background: "#0A0A0A", minHeight: "100vh", color: "white", overflowX: "hidden" }}>
      <HomeBackground />
      <Navbar />

      {/* HERO */}
      <section style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", zIndex: 1 }}>
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div style={{ margin: "0 auto", width: "90%", maxWidth: "1100px", height: "520px", background: "rgba(0,0,0,0.96)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", position: "relative", overflow: "hidden", display: "flex" }}>
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, maxWidth: "300px", marginBottom: "2rem" }}
          >
          </motion.p>

          {/* Left */}
          <div style={{ flex: 1, padding: "3rem", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", zIndex: 10 }}>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              style={{ color: "#E8C547", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.2rem" }}>
              Welcome to PetNest 🐾
            </motion.p>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.1, background: "linear-gradient(to bottom, #ffffff, #666666)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "1rem" }}>
              Find Your<br />Forever<br />Friend.
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              style={{ color: "#888", fontSize: "14px", lineHeight: 1.7, maxWidth: "300px", marginBottom: "2rem" }}>
                          From Brooklyn to the Bronx — find dogs, cats, birds, and more across all five NYC boroughs. Your perfect companion is just around the corner.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
              style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link to="/pets" style={{ background: "#E8C547", color: "#000", fontWeight: 600, padding: "10px 28px", borderRadius: "999px", fontSize: "13px", textDecoration: "none" }}>
                Browse Pets
              </Link>
              <Link to="/register" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "10px 28px", borderRadius: "999px", fontSize: "13px", textDecoration: "none" }}>
                Create Account
              </Link>
            </motion.div>
          </div>

          {/* Right — Cat */}
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,197,71,0.15) 0%, transparent 70%)", filter: "blur(20px)" }} />
            <CuteCat />
          </div>
        </div>
      </section>
      <div style={{ position: "relative", zIndex: 1 }}>
        <PetOrbit />
      </div>


{/* FEATURES with animated gold border */}
<section style={{ maxWidth: "1100px", margin: "0 auto", padding: "5rem 2rem", position: "relative", zIndex: 1 }}>
  <motion.p
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    style={{ color: "#E8C547", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", textAlign: "center", marginBottom: "12px" }}
  >
    Why PetNest
  </motion.p>
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    style={{ fontSize: "2.5rem", fontWeight: 700, textAlign: "center", color: "white", marginBottom: "3rem", textShadow: "0 0 40px rgba(0,0,0,0.8)" }}
  >
    Why PetNest?
  </motion.h2>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
    {[
      { icon: "🐾", title: "Verified Healthy Pets", text: "Every animal is vet-checked and ready for their new home." },
      { icon: "🏠", title: "Matched to Your Home", text: "Filter by size, energy and species to find your fit." },
      { icon: "💛", title: "Loved Before They Arrive", text: "Our pets are raised with care — not just sold." },
      { icon: "🔒", title: "Secure Checkout", text: "Your order and personal data are always protected." },
    ].map((f, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.1 }}
        className="gradient-border-auto"
        style={{
          padding: "24px",
          borderRadius: "16px",
          border: "2px solid transparent",
          backgroundImage: `
            linear-gradient(#1a1a1a, #1a1a1a),
            conic-gradient(
              from var(--gradient-angle, 0deg),
              #784f10 0%,
              #E8C547 37%,
              #fff5c0 50%,
              #E8C547 63%,
              #784f10 100%
            )
          `,
          backgroundClip: "padding-box, border-box",
          backgroundOrigin: "padding-box, border-box",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>{f.icon}</div>
        <h3 style={{ color: "#ffffff", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>{f.title}</h3>
        <p style={{ color: "#bbbbbb", fontSize: "13px", lineHeight: 1.6 }}>{f.text}</p>
      </motion.div>
    ))}
  </div>
</section>

      {/* CTA */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem 5rem", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ background: "#111", border: "1px solid rgba(232,197,71,0.2)", borderRadius: "24px", padding: "4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(232,197,71,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />
          <p style={{ color: "#E8C547", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1rem" }}>Ready to find your companion?</p>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 700, color: "white", marginBottom: "1rem", lineHeight: 1.2, textShadow: "0 0 40px rgba(0,0,0,0.8)" }}>Your forever friend<br />is waiting for you.</h2>
          <p style={{ color: "#666", fontSize: "14px", maxWidth: "400px", margin: "0 auto 2rem" }}>Browse our full selection of healthy, happy pets — each one ready to join your family.</p>
          <Link to="/pets" style={{ display: "inline-block", background: "#E8C547", color: "#000", fontWeight: 600, padding: "12px 36px", borderRadius: "999px", fontSize: "14px", textDecoration: "none" }}>
            Browse All Pets
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ color: "white", fontWeight: 700, fontSize: "18px" }}>Pet<span style={{ color: "#E8C547" }}>Nest</span> 🐾</div>
        <p style={{ color: "#444", fontSize: "12px" }}>Find Your Forever Friend.</p>
        <p style={{ color: "#333", fontSize: "12px" }}>© 2026 PetNest.</p>
      </footer>
    </div>
  );
}
