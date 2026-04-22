import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar({ cartCount = 0 }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
      zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: "32px", padding: "10px 24px",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: scrolled ? "rgba(10,10,10,0.9)" : "rgba(10,10,10,0.6)",
      backdropFilter: "blur(16px)",
      transition: "all 0.3s ease",
      width: "min(700px, 90vw)",
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", fontWeight: 800, fontSize: "17px", color: "white", whiteSpace: "nowrap" }}>
        Pet<span style={{ color: "#E8C547" }}>Nest</span> 🐾
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        {["Pets", "Categories", "About"].map(l => (
          <Link key={l} to={l === "Pets" ? "/pets" : "/"} style={{
            color: "#888", fontSize: "13px", textDecoration: "none",
            transition: "color 0.2s",
          }}
            onMouseEnter={e => e.target.style.color = "white"}
            onMouseLeave={e => e.target.style.color = "#888"}
          >{l}</Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Cart */}
        <Link to="/cart" style={{ position: "relative", color: "#888", textDecoration: "none", fontSize: "18px" }}>
          🛒
          {cartCount > 0 && (
            <span style={{
              position: "absolute", top: "-6px", right: "-6px",
              background: "#E8C547", color: "#000", fontSize: "10px",
              width: "16px", height: "16px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
            }}>{cartCount}</span>
          )}
        </Link>

        {/* Login */}
        <Link to="/login" style={{
          padding: "6px 16px", borderRadius: "999px", fontSize: "13px",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#ccc", textDecoration: "none", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = "rgba(255,255,255,0.4)"; e.target.style.color = "white"; }}
          onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; e.target.style.color = "#ccc"; }}
        >Login</Link>

        {/* Sign up */}
        <Link to="/register" style={{
          padding: "6px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 600,
          background: "linear-gradient(to bottom right, #f0d060, #E8C547)",
          color: "#000", textDecoration: "none", transition: "all 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >Sign up</Link>
      </div>
    </nav>
  );
}