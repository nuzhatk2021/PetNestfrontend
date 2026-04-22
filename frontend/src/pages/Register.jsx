import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ShaderMaterial = ({ source, uniforms }) => {
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
      switch (u.type) {
        case "uniform1f": prepared[name] = { value: u.value }; break;
        case "uniform1i": prepared[name] = { value: u.value }; break;
        case "uniform1fv": prepared[name] = { value: u.value }; break;
        case "uniform3fv":
          prepared[name] = { value: u.value.map(v => new THREE.Vector3().fromArray(v)) };
          break;
        default: break;
      }
    }
    prepared["u_time"] = { value: 0 };
    prepared["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) };
    return prepared;
  };

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      precision mediump float;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        gl_Position = vec4(position.xy, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
    `,
    fragmentShader: source,
    uniforms: getUniforms(),
    glslVersion: THREE.GLSL3,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneFactor,
  }), [size.width, size.height, source]);

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

const DotMatrix = ({ colors = [[232, 197, 71]], opacities, dotSize = 3, reverse = false }) => {
  const totalSize = 20;
  const ops = opacities || [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1];

  const uniforms = useMemo(() => {
    let colorsArray = [colors[0], colors[0], colors[0], colors[0], colors[0], colors[0]];
    if (colors.length === 2) colorsArray = [colors[0], colors[0], colors[0], colors[1], colors[1], colors[1]];
    return {
      u_colors: { value: colorsArray.map(c => [c[0]/255, c[1]/255, c[2]/255]), type: "uniform3fv" },
      u_opacities: { value: ops, type: "uniform1fv" },
      u_total_size: { value: totalSize, type: "uniform1f" },
      u_dot_size: { value: dotSize, type: "uniform1f" },
      u_reverse: { value: reverse ? 1 : 0, type: "uniform1i" },
    };
  }, [colors, ops, dotSize, reverse]);

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
      float speed = 0.5;
      vec2 center = u_resolution / 2.0 / u_total_size;
      float dist = distance(center, st2);
      float max_dist = distance(center, vec2(0.0, 0.0));
      float offset_in = dist * 0.01 + random(st2) * 0.15;
      float offset_out = (max_dist - dist) * 0.02 + random(st2 + 42.0) * 0.2;
      if (u_reverse == 1) {
        opacity *= 1.0 - step(offset_out, u_time * speed);
        opacity *= clamp(step(offset_out + 0.1, u_time * speed) * 1.25, 1.0, 1.25);
      } else {
        opacity *= step(offset_in, u_time * speed);
        opacity *= clamp((1.0 - step(offset_in + 0.1, u_time * speed)) * 1.25, 1.0, 1.25);
      }
      fragColor = vec4(color, opacity);
      fragColor.rgb *= fragColor.a;
    }
  `;

  return <ShaderMaterial source={source} uniforms={uniforms} />;
};

const CanvasEffect = ({ reverse = false, colors }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <Canvas style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <DotMatrix colors={colors} dotSize={4} reverse={reverse} />
    </Canvas>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "33%", background: "linear-gradient(to bottom, black, transparent)" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "33%", background: "linear-gradient(to top, black, transparent)" }} />
  </div>
);

function RegisterNavbar() {
  return (
    <div style={{
      position: "fixed", top: "24px", left: "50%", transform: "translateX(-50%)",
      zIndex: 50, display: "flex", alignItems: "center", gap: "32px",
      padding: "12px 28px", borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(10,10,10,0.7)", backdropFilter: "blur(12px)",
    }}>
      <Link to="/" style={{ textDecoration: "none", fontWeight: 700, fontSize: "16px", color: "white" }}>
        Pet<span style={{ color: "#E8C547" }}>Nest</span> 🐾
      </Link>
      <div style={{ display: "flex", gap: "24px" }}>
        {["Pets", "Categories", "About"].map(l => (
          <Link key={l} to="/pets" style={{ color: "#888", fontSize: "13px", textDecoration: "none" }}>{l}</Link>
        ))}
      </div>
      <Link to="/login" style={{
        padding: "6px 18px", borderRadius: "999px", fontSize: "13px",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#ccc", textDecoration: "none",
      }}>
        Login
      </Link>
    </div>
  );
}

export default function Register({ onRegister }) {
  const [step, setStep] = useState("form");
  const [showReverse, setShowReverse] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.username) errs.username = "Username is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.password || form.password.length < 6) errs.password = "Min 6 characters";
    if (form.password !== form.confirm) errs.confirm = "Passwords don't match";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setShowReverse(true);
    setTimeout(() => setStep("success"), 2000);
  };

  const inputStyle = (hasError) => ({
    width: "100%", background: "rgba(255,255,255,0.03)",
    border: `1px solid ${hasError ? "rgba(232,80,80,0.6)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "12px", padding: "12px 16px", color: "white", fontSize: "14px",
    outline: "none", boxSizing: "border-box", transition: "border 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#000", position: "relative", display: "flex", flexDirection: "column", color: "white" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <CanvasEffect reverse={showReverse} colors={[[232, 197, 71], [255, 255, 255]]} />
      </div>

      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", flex: 1 }}>
        <RegisterNavbar />

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 40px" }}>
          <div style={{ width: "100%", maxWidth: "420px" }}>
            <AnimatePresence mode="wait">

              {/* ── FORM STEP ── */}
              {step === "form" && (
                <motion.div key="form"
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                >
                  <div style={{ textAlign: "center", marginBottom: "8px" }}>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.1, color: "white", marginBottom: "8px" }}>
                      Create Account 🐾
                    </h1>
                    <p style={{ color: "#666", fontSize: "14px" }}>
                      Already have one?{" "}
                      <Link to="/login" style={{ color: "#E8C547", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
                    </p>
                  </div>

                  {/* Google */}
                  <button style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "999px", padding: "12px 20px", color: "white", fontSize: "14px", cursor: "pointer",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  >
                    <span style={{ fontWeight: 700, fontSize: "16px" }}>G</span>
                    Sign up with Google
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                    <span style={{ color: "#555", fontSize: "12px" }}>or</span>
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* Username */}
                    <div>
                      <label style={{ color: "#888", fontSize: "12px", marginBottom: "6px", display: "block" }}>Username</label>
                      <input placeholder="yourname" value={form.username}
                        onChange={e => setForm({ ...form, username: e.target.value })}
                        style={inputStyle(errors.username)}
                        onFocus={e => e.target.style.borderColor = "rgba(232,197,71,0.5)"}
                        onBlur={e => e.target.style.borderColor = errors.username ? "rgba(232,80,80,0.6)" : "rgba(255,255,255,0.1)"}
                      />
                      {errors.username && <p style={{ color: "#E05252", fontSize: "11px", marginTop: "4px" }}>{errors.username}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{ color: "#888", fontSize: "12px", marginBottom: "6px", display: "block" }}>Email</label>
                      <input type="email" placeholder="your@email.com" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        style={inputStyle(errors.email)}
                        onFocus={e => e.target.style.borderColor = "rgba(232,197,71,0.5)"}
                        onBlur={e => e.target.style.borderColor = errors.email ? "rgba(232,80,80,0.6)" : "rgba(255,255,255,0.1)"}
                      />
                      {errors.email && <p style={{ color: "#E05252", fontSize: "11px", marginTop: "4px" }}>{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div>
                      <label style={{ color: "#888", fontSize: "12px", marginBottom: "6px", display: "block" }}>Password</label>
                      <input type="password" placeholder="••••••••" value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        style={inputStyle(errors.password)}
                        onFocus={e => e.target.style.borderColor = "rgba(232,197,71,0.5)"}
                        onBlur={e => e.target.style.borderColor = errors.password ? "rgba(232,80,80,0.6)" : "rgba(255,255,255,0.1)"}
                      />
                      {errors.password && <p style={{ color: "#E05252", fontSize: "11px", marginTop: "4px" }}>{errors.password}</p>}
                    </div>

                    {/* Confirm */}
                    <div>
                      <label style={{ color: "#888", fontSize: "12px", marginBottom: "6px", display: "block" }}>Confirm Password</label>
                      <input type="password" placeholder="••••••••" value={form.confirm}
                        onChange={e => setForm({ ...form, confirm: e.target.value })}
                        style={inputStyle(errors.confirm)}
                        onFocus={e => e.target.style.borderColor = "rgba(232,197,71,0.5)"}
                        onBlur={e => e.target.style.borderColor = errors.confirm ? "rgba(232,80,80,0.6)" : "rgba(255,255,255,0.1)"}
                      />
                      {errors.confirm && <p style={{ color: "#E05252", fontSize: "11px", marginTop: "4px" }}>{errors.confirm}</p>}
                    </div>

                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{
                        width: "100%", padding: "14px", borderRadius: "999px", fontWeight: 700, fontSize: "14px",
                        background: "linear-gradient(to right, #f0d060, #E8C547)", color: "#000", border: "none",
                        cursor: "pointer", marginTop: "4px",
                      }}>
                      Create Account →
                    </motion.button>
                  </form>

                  <p style={{ color: "#444", fontSize: "11px", lineHeight: 1.6, textAlign: "center" }}>
                    By signing up, you agree to our{" "}
                    <span style={{ color: "#666", textDecoration: "underline", cursor: "pointer" }}>Terms</span>,{" "}
                    <span style={{ color: "#666", textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>, and{" "}
                    <span style={{ color: "#666", textDecoration: "underline", cursor: "pointer" }}>Cookie Notice</span>.
                  </p>
                </motion.div>
              )}

              {/* ── SUCCESS STEP ── */}
              {step === "success" && (
                <motion.div key="success"
                  initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                  style={{ display: "flex", flexDirection: "column", gap: "28px", textAlign: "center", alignItems: "center" }}
                >
                  <div>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "white", marginBottom: "8px" }}>
                      Welcome to PetNest! 🎉
                    </h1>
                    <p style={{ color: "#666", fontSize: "16px" }}>Your account has been created</p>
                  </div>

                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}
                    style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(to bottom right, #f0d060, #E8C547)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 20 20" fill="black">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <Link to="/" style={{
                      display: "block", width: "100%", padding: "14px", borderRadius: "999px", textAlign: "center",
                      background: "linear-gradient(to right, #f0d060, #E8C547)", color: "#000", fontWeight: 700,
                      fontSize: "14px", textDecoration: "none", boxSizing: "border-box",
                    }}>
                      Browse Pets →
                    </Link>
                    <Link to="/login" style={{
                      display: "block", width: "100%", padding: "14px", borderRadius: "999px", textAlign: "center",
                      border: "1px solid rgba(255,255,255,0.1)", color: "#888",
                      fontSize: "14px", textDecoration: "none", boxSizing: "border-box",
                    }}>
                      Sign in instead
                    </Link>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
