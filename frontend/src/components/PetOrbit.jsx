import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

// NYC Map SVG - simplified street grid style
const NYCMap = () => (
  <svg viewBox="0 0 200 200" style={{ width: "100%", height: "100%", opacity: 0.6 }}>
    {/* Water background */}
    <rect width="200" height="200" fill="#0A0A0A" />
    
    {/* Manhattan island shape */}
    <polygon points="95,20 110,18 125,25 130,40 128,70 125,100 120,130 115,155 108,175 100,185 92,175 85,155 78,130 72,100 70,70 72,40 80,25"
      fill="none" stroke="rgba(232,197,71,0.4)" strokeWidth="1" />
    
    {/* Manhattan grid streets horizontal */}
    {[30,45,60,75,90,105,120,135,150,165].map((y, i) => (
      <line key={`h${i}`} x1="72" y1={y} x2="130" y2={y} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
    ))}
    {/* Manhattan grid streets vertical */}
    {[80,88,96,104,112,120].map((x, i) => (
      <line key={`v${i}`} x1={x} y1="20" x2={x} y2="185" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    ))}

    {/* Brooklyn */}
    <polygon points="85,175 115,175 130,185 135,195 120,200 80,200 65,195 70,185"
      fill="none" stroke="rgba(232,197,71,0.25)" strokeWidth="0.8" />
    {/* Brooklyn streets */}
    {[182,190].map((y, i) => (
      <line key={`bh${i}`} x1="68" y1={y} x2="132" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
    ))}

    {/* Queens - right side */}
    <polygon points="130,60 130,140 155,145 165,130 168,100 165,70 155,55"
      fill="none" stroke="rgba(232,197,71,0.2)" strokeWidth="0.8" />
    {[75,90,105,120,135].map((y, i) => (
      <line key={`qh${i}`} x1="130" y1={y} x2="165" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
    ))}

    {/* Bronx - top right */}
    <polygon points="110,18 140,15 155,25 155,55 130,60 125,40"
      fill="none" stroke="rgba(232,197,71,0.2)" strokeWidth="0.8" />

    {/* Staten Island - bottom left */}
    <polygon points="30,150 55,145 65,160 60,180 40,185 25,175 20,160"
      fill="none" stroke="rgba(232,197,71,0.2)" strokeWidth="0.8" />

    {/* Hudson River */}
    <path d="M72,20 Q50,60 45,100 Q42,140 50,175" fill="none" stroke="rgba(30,80,150,0.3)" strokeWidth="8" />
    
    {/* East River */}
    <path d="M130,20 Q148,60 150,100 Q148,140 130,175" fill="none" stroke="rgba(30,80,150,0.25)" strokeWidth="6" />

    {/* Borough labels */}
    <text x="100" y="100" textAnchor="middle" fill="rgba(232,197,71,0.6)" fontSize="6" fontWeight="bold">MANHATTAN</text>
    <text x="148" y="105" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">QUEENS</text>
    <text x="100" y="192" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">BROOKLYN</text>
    <text x="135" y="40" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">BRONX</text>
    <text x="42" y="168" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="4">STATEN IS.</text>

    {/* Center glow */}
    <circle cx="100" cy="100" r="8" fill="rgba(232,197,71,0.15)" />
    <circle cx="100" cy="100" r="4" fill="rgba(232,197,71,0.3)" />
    <circle cx="100" cy="100" r="2" fill="#E8C547" />
  </svg>
);

const PETS = [
  { id: 1, emoji: "🐕", name: "Mochi", breed: "Shiba Inu", price: "$450", borough: "Brooklyn", neighborhood: "Williamsburg", category: "Dogs", energy: 90 },
  { id: 2, emoji: "🐈", name: "Luna", breed: "British Shorthair", price: "$320", borough: "Manhattan", neighborhood: "Harlem", category: "Cats", energy: 70 },
  { id: 3, emoji: "🦜", name: "Kiwi", breed: "Parakeet", price: "$80", borough: "Queens", neighborhood: "Astoria", category: "Birds", energy: 85 },
  { id: 4, emoji: "🐠", name: "Nemo", breed: "Clownfish", price: "$40", borough: "Staten Island", neighborhood: "St. George", category: "Fish", energy: 50 },
  { id: 5, emoji: "🐕", name: "Coco", breed: "Golden Retriever", price: "$800", borough: "Bronx", neighborhood: "Riverdale", category: "Dogs", energy: 95 },
  { id: 6, emoji: "🐈", name: "Bella", breed: "Siamese", price: "$280", borough: "Brooklyn", neighborhood: "Park Slope", category: "Cats", energy: 65 },
  { id: 7, emoji: "🐹", name: "Peanut", breed: "Hamster", price: "$30", borough: "Queens", neighborhood: "Flushing", category: "Small Pets", energy: 75 },
  { id: 8, emoji: "🦎", name: "Spike", breed: "Bearded Dragon", price: "$150", borough: "Manhattan", neighborhood: "Upper West Side", category: "Reptiles", energy: 55 },
];

export default function PetOrbit() {
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (autoRotate) {
      timerRef.current = setInterval(() => {
        setRotation(prev => (prev + 0.3) % 360);
      }, 50);
    }
    return () => clearInterval(timerRef.current);
  }, [autoRotate]);

  const getPosition = (index, total) => {
    const angle = ((index / total) * 360 + rotation) % 360;
    const radius = 200;
    const rad = (angle * Math.PI) / 180;
    const x = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    const zIndex = Math.round(100 + 50 * Math.cos(rad));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(rad)) / 2)));
    return { x, y, zIndex, opacity };
  };

  const handleClick = (id) => {
    if (activeId === id) {
      setActiveId(null);
      setAutoRotate(true);
    } else {
      setActiveId(id);
      setAutoRotate(false);
    }
  };

  const activePet = PETS.find(p => p.id === activeId);

  return (
    <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 2rem" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p style={{ color: "#E8C547", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>
          Hyperlocal · New York City
        </p>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#ffffff", marginBottom: "12px", textShadow: "0 2px 20px rgba(0,0,0,1)" }}>
          Find Your Match
        </h2>
        <p style={{ color: "#cccccc", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
          Pets available across all five boroughs — click any pet to learn more
        </p>
      </div>

      {/* Orbital container */}
      <div style={{ position: "relative", width: "100%", height: "560px", display: "flex", alignItems: "center", justifyContent: "center" }}
        onClick={() => { setActiveId(null); setAutoRotate(true); }}>

        {/* Orbit ring */}
        <div style={{
          position: "absolute",
          width: "400px", height: "400px",
          borderRadius: "50%",
          border: "1px solid rgba(232,197,71,0.4)",
          boxShadow: "0 0 60px rgba(232,197,71,0.08)",
        }} />
        <div style={{
          position: "absolute",
          width: "420px", height: "420px",
          borderRadius: "50%",
          border: "1px dashed rgba(255,255,255,0.05)",
        }} />

        {/* NYC Map center */}
        <div style={{
          position: "absolute",
          width: "160px", height: "160px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid rgba(232,197,71,0.4)",
          boxShadow: "0 0 30px rgba(232,197,71,0.15), inset 0 0 20px rgba(0,0,0,0.8)",
          zIndex: 10,
          background: "#0A0A0A",
        }}>
          <NYCMap />
        </div>

        {/* Orbiting pets */}
        {PETS.map((pet, i) => {
          const pos = getPosition(i, PETS.length);
          const isActive = activeId === pet.id;

          return (
            <div
              key={pet.id}
              onClick={(e) => { e.stopPropagation(); handleClick(pet.id); }}
              style={{
                position: "absolute",
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                zIndex: isActive ? 200 : pos.zIndex,
                opacity: isActive ? 1 : pos.opacity,
                transition: "opacity 0.3s",
                cursor: "pointer",
              }}
            >
              {/* Glow ring */}
              <div style={{
                position: "absolute",
                inset: "-12px",
                borderRadius: "50%",
                background: isActive ? "rgba(232,197,71,0.2)" : "rgba(232,197,71,0.05)",
                filter: "blur(8px)",
                transition: "all 0.3s",
              }} />

              {/* Pet node */}
              <motion.div
                whileHover={{ scale: 1.2 }}
                style={{
                  width: "48px", height: "48px",
                  borderRadius: "50%",
                  background: isActive ? "#E8C547" : "rgba(10,10,10,0.9)",
                  border: `2px solid ${isActive ? "#E8C547" : "rgba(232,197,71,0.4)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px",
                  boxShadow: isActive ? "0 0 20px rgba(232,197,71,0.5)" : "none",
                  transition: "all 0.3s",
                  transform: isActive ? "scale(1.3)" : "scale(1)",
                }}
              >
                {pet.emoji}
              </motion.div>

              {/* Pet name label */}
              <div style={{
                position: "absolute",
                top: "54px",
                left: "50%",
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                fontSize: "11px",
                fontWeight: 600,
                color: isActive ? "#E8C547" : "rgba(255,255,255,0.85)",
                transition: "all 0.3s",
              }}>
                {pet.name}
              </div>

              {/* Info card on click */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.2 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      top: "70px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "200px",
                      background: "rgba(10,10,10,0.95)",
                      border: "1px solid rgba(232,197,71,0.3)",
                      borderRadius: "16px",
                      padding: "16px",
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
                      zIndex: 300,
                    }}
                  >
                    {/* Connector line */}
                    <div style={{
                      position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                      width: "1px", height: "12px", background: "rgba(232,197,71,0.4)",
                    }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: "11px", background: "rgba(232,197,71,0.15)", color: "#E8C547", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>
                        {pet.category}
                      </span>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "#E8C547" }}>{pet.price}</span>
                    </div>
                    <p style={{ color: "white", fontWeight: 700, fontSize: "15px", marginBottom: "8px" }}>{pet.name}</p>
                    <p style={{ color: "#aaa", fontSize: "13px", lineHeight: 1.6 }}>{pet.breed}</p>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "12px" }}>📍</span>
                      <span style={{ color: "#888", fontSize: "12px" }}>{pet.neighborhood}, {pet.borough}</span>
                    </div>

                    {/* Energy bar */}
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ color: "#555", fontSize: "11px" }}>Energy Level</span>
                        <span style={{ color: "#888", fontSize: "11px" }}>{pet.energy}%</span>
                      </div>
                      <div style={{ height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pet.energy}%`, background: "linear-gradient(to right, #E8C547, #f0d060)", borderRadius: "999px" }} />
                      </div>
                    </div>

                    <Link to="/pets" style={{
                      display: "block", width: "100%", textAlign: "center",
                      padding: "8px", borderRadius: "999px",
                      background: "linear-gradient(to right, #E8C547, #f0d060)",
                      color: "#000", fontWeight: 700, fontSize: "12px",
                      textDecoration: "none", boxSizing: "border-box",
                    }}>
                      View Details →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom hint */}
      <p style={{ textAlign: "center", color: "#333", fontSize: "12px", marginTop: "-1rem" }}>
        Click a pet to explore · Click anywhere to resume rotation
      </p>
    </section>
  );
}
