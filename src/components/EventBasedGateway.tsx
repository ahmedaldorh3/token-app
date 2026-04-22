import { useState, useEffect, useRef } from "react";

const SCENARIOS = [
  {
    name: "Order Reply",
    icon: "📦",
    color: "#60c8ff",
    description: "After sending an order request, the process waits for either a confirmation message or a 2-hour timeout.",
    setup: "Send Order Request",
    setupIcon: "📤",
    paths: [
      {
        id: "confirm",
        event: "message",
        icon: "📨",
        label: "Order Confirmed",
        eventLabel: "Message Received",
        color: "#4cff88",
        next: "Process Order",
        nextIcon: "📦",
        outcome: "✅ Order confirmed! The process continues to fulfillment.",
      },
      {
        id: "timeout",
        event: "timer",
        icon: "⏱",
        label: "2 Hours Pass",
        eventLabel: "Timer Fires",
        color: "#ff9944",
        next: "Cancel Order",
        nextIcon: "❌",
        outcome: "⏰ No reply received. The order is automatically cancelled.",
      },
      {
        id: "reject",
        event: "message",
        icon: "🚫",
        label: "Order Rejected",
        eventLabel: "Message Received",
        color: "#ff4c4c",
        next: "Notify Customer",
        nextIcon: "📧",
        outcome: "❌ Order was rejected. Customer is notified.",
      },
    ],
  },
  {
    name: "Smart Alarm",
    icon: "🏠",
    color: "#ff9944",
    description: "A smart home system enters sleep mode and waits — either a scheduled time alarm or a motion sensor triggers next.",
    setup: "Enter Sleep Mode",
    setupIcon: "😴",
    paths: [
      {
        id: "time",
        event: "timer",
        icon: "⏰",
        label: "7:00 AM Alarm",
        eventLabel: "Timer Fires",
        color: "#ff9944",
        next: "Turn On Lights",
        nextIcon: "💡",
        outcome: "⏰ Morning alarm fires. Lights turn on and the house wakes up.",
      },
      {
        id: "sensor",
        event: "signal",
        icon: "🚨",
        label: "Motion Detected",
        eventLabel: "Signal Received",
        color: "#ff4c4c",
        next: "Alert Security",
        nextIcon: "🔒",
        outcome: "🚨 Motion sensor triggered at night. Security is alerted.",
      },
    ],
  },
  {
    name: "Customer Email",
    icon: "📧",
    color: "#c084ff",
    description: "After sending a support email, the system waits for either a customer reply, a 24-hour follow-up timer, or a bounce.",
    setup: "Send Support Email",
    setupIcon: "📧",
    paths: [
      {
        id: "reply",
        event: "message",
        icon: "💬",
        label: "Customer Replies",
        eventLabel: "Message Received",
        color: "#4cff88",
        next: "Process Response",
        nextIcon: "✅",
        outcome: "💬 Customer replied! Support agent processes the response.",
      },
      {
        id: "followup",
        event: "timer",
        icon: "⏱",
        label: "24hrs No Reply",
        eventLabel: "Timer Fires",
        color: "#ff9944",
        next: "Send Follow-up",
        nextIcon: "📨",
        outcome: "⏰ No response after 24 hours. A follow-up email is sent.",
      },
      {
        id: "bounce",
        event: "error",
        icon: "⚠️",
        label: "Email Bounced",
        eventLabel: "Error Received",
        color: "#ff4c4c",
        next: "Flag Invalid Email",
        nextIcon: "🚩",
        outcome: "⚠️ Email bounced. The address is flagged as invalid.",
      },
    ],
  },
];

const EVENT_ICONS = { message: "📨", timer: "⏱", signal: "📡", error: "⚠️" };

function GatewaySymbol({ waiting, color, pulse }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 54, height: 54,
        background: waiting ? "#0d2a4a" : "#0a1020",
        border: `2px solid ${waiting ? color : "#1a2a4a"}`,
        borderRadius: 4,
        transform: "rotate(45deg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: waiting ? `0 0 22px ${color}55` : "none",
        transition: "all 0.4s",
        position: "relative",
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          border: `2px solid ${waiting ? color : "#2a4a6a"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(-45deg)",
          transition: "all 0.4s",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            border: `2px solid ${waiting ? color : "#2a4a6a"}`,
            background: "transparent",
            transition: "all 0.4s",
          }} />
        </div>
        {pulse && (
          <div style={{
            position: "absolute", inset: -8,
            borderRadius: 4, border: `2px solid ${color}`,
            opacity: 0, animation: "ping 1.2s ease-out infinite",
          }} />
        )}
      </div>
      <span style={{ fontSize: 9, color: waiting ? color : "#2a4a6a", letterSpacing: 1.5, textTransform: "uppercase" }}>
        Event Gateway
      </span>
    </div>
  );
}

function PathRow({ path, state, scenarioColor }) {
  // state: idle | waiting | fired | cancelled
  const stateColor = {
    idle: "#1a2a4a",
    waiting: scenarioColor,
    fired: path.color,
    cancelled: "#1a1a2a",
  };
  const textColor = {
    idle: "#2a4a6a",
    waiting: scenarioColor,
    fired: path.color,
    cancelled: "#2a2a3a",
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: state === "fired" ? path.color + "11" : state === "cancelled" ? "#0a0a14" : "#090e1c",
      border: `1px solid ${stateColor[state]}`,
      borderRadius: 12, padding: "12px 14px",
      transition: "all 0.4s",
      opacity: state === "cancelled" ? 0.35 : 1,
    }}>
      {/* Flow line */}
      <div style={{ width: 30, height: 2, background: stateColor[state], borderRadius: 1, flexShrink: 0, transition: "background 0.4s" }} />

      {/* Catching Event */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: state === "fired" ? path.color + "22" : "#0a1020",
        border: `2px solid ${stateColor[state]}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, flexShrink: 0,
        boxShadow: state === "fired" ? `0 0 14px ${path.color}66` : "none",
        transition: "all 0.4s",
      }}>
        <span style={{ fontSize: 16 }}>{path.icon}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: textColor[state], fontWeight: "bold", marginBottom: 2 }}>{path.label}</div>
        <div style={{ fontSize: 9.5, color: "#2a4a6a", letterSpacing: 1 }}>{path.eventLabel}</div>
      </div>

      {/* Arrow + next task */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ color: stateColor[state], fontSize: 16, transition: "color 0.4s" }}>→</div>
        <div style={{
          background: state === "fired" ? path.color + "22" : "#0a1020",
          border: `1px solid ${stateColor[state]}`,
          borderRadius: 8, padding: "6px 10px",
          display: "flex", alignItems: "center", gap: 6,
          transition: "all 0.4s",
        }}>
          <span style={{ fontSize: 14 }}>{path.nextIcon}</span>
          <span style={{ fontSize: 10, color: textColor[state], fontWeight: "bold" }}>{path.next}</span>
        </div>
      </div>

      {/* Status badge */}
      <div style={{
        fontSize: 9, padding: "3px 8px", borderRadius: 20,
        background: state === "fired" ? path.color + "33" : state === "cancelled" ? "#1a1a2a" : "#0a1020",
        color: state === "fired" ? path.color : state === "waiting" ? scenarioColor : "#2a3a5a",
        border: `1px solid ${state === "fired" ? path.color + "55" : "#1a2a4a"}`,
        flexShrink: 0, letterSpacing: 1, textTransform: "uppercase",
        transition: "all 0.4s",
      }}>
        {state === "idle" ? "Idle" : state === "waiting" ? "Watching…" : state === "fired" ? "✓ Fired!" : "Cancelled"}
      </div>
    </div>
  );
}

export default function EventBasedGateway() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | setup | waiting | fired | done
  const [firedPath, setFiredPath] = useState<string | null>(null);
  const [auto, setAuto] = useState(false);
  const timerRef = useRef<number | null>(null);
  const scenario = SCENARIOS[scenarioIdx];

  useEffect(() => {
    if (auto) {
      let i = 0;
      timerRef.current = setInterval(() => {
        if (i === 0) { setPhase("setup"); i++; }
        else if (i === 1) { setPhase("waiting"); i++; }
        else {
          const idx = Math.floor(Math.random() * scenario.paths.length);
          setFiredPath(scenario.paths[idx].id);
          setPhase("fired");
          setAuto(false);
          clearInterval(timerRef.current ?? undefined);
        }
      }, 1600);
    }
    return () => clearInterval(timerRef.current ?? undefined);
  }, [auto, scenario]);

  const reset = () => { setPhase("idle"); setFiredPath(null); setAuto(false); clearInterval(timerRef.current ?? undefined); };
  const switchScenario = (i) => { setScenarioIdx(i); reset(); };

  const fireRandom = () => {
    const idx = Math.floor(Math.random() * scenario.paths.length);
    setFiredPath(scenario.paths[idx].id);
    setPhase("fired");
  };

  const getPathState = (pathId) => {
    if (phase === "idle") return "idle";
    if (phase === "setup") return "idle";
    if (phase === "waiting") return "waiting";
    if (phase === "fired") return firedPath === pathId ? "fired" : "cancelled";
    return "idle";
  };

  const firedPathObj = scenario.paths.find(p => p.id === firedPath);

  const stepInfo = {
    idle: { title: "Process Ready", desc: `Click Next or Auto Play to start the ${scenario.name} scenario.`, color: "#4a6ab5" },
    setup: { title: scenario.setup, desc: `The process executes "${scenario.setup}" successfully. Next it reaches the Event-Based Gateway.`, color: scenario.color },
    waiting: { title: "⊙ Gateway Waiting…", desc: `The process is paused at the Event-Based Gateway. It is watching all ${scenario.paths.length} possible events. Whichever fires first will win — the rest are cancelled.`, color: scenario.color },
    fired: { title: `${firedPathObj?.icon} ${firedPathObj?.label}`, desc: firedPathObj?.outcome || "", color: firedPathObj?.color || "#4cff88" },
  };
  const info = stepInfo[phase];

  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "linear-gradient(135deg, #06080f 0%, #090c18 60%, #07090f 100%)",
      minHeight: "100vh", color: "#c8dff0",
      padding: "28px 20px", boxSizing: "border-box",
    }}>
      <style>{`@keyframes ping { 0%{opacity:0.6;transform:scale(1)} 100%{opacity:0;transform:scale(1.8)} }`}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#4a6ab5", textTransform: "uppercase", marginBottom: 6 }}>BPMN Concept</div>
        <h1 style={{ margin: 0, fontSize: 26, color: "#e8f4ff", letterSpacing: 1 }}>Event-Based Gateway</h1>
        <p style={{ margin: "8px auto 0", color: "#5a7ab8", fontSize: 13, maxWidth: 500 }}>
          The process waits — whichever event fires first wins, all others are cancelled
        </p>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {SCENARIOS.map((s, i) => (
          <button key={i} onClick={() => switchScenario(i)} style={{
            background: scenarioIdx === i ? "#0d1f3a" : "#090e1c",
            border: `1px solid ${scenarioIdx === i ? s.color : "#1e3060"}`,
            borderRadius: 8, color: scenarioIdx === i ? s.color : "#3a5a8a",
            padding: "8px 16px", fontSize: 12, cursor: "pointer",
          }}>{s.icon} {s.name}</button>
        ))}
      </div>

      {/* Scenario description */}
      <div style={{
        background: "#090e1c", border: "1px solid #1a2a4a", borderRadius: 10,
        padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#5a7ab0", lineHeight: 1.6,
      }}>{scenario.description}</div>

      {/* Main Diagram */}
      <div style={{ background: "#070c18", border: "1px solid #1a2a4a", borderRadius: 14, padding: "20px 16px", marginBottom: 16 }}>

        {/* Top row: setup task → gateway */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          {/* Start */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: phase !== "idle" ? "#0d2a1a" : "#0a1020",
              border: `2px solid ${phase !== "idle" ? "#4cff88" : "#2a5a4a"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.4s",
            }}>
              <span style={{ fontSize: 13, color: phase !== "idle" ? "#4cff88" : "#2a5a4a" }}>▶</span>
            </div>
            <span style={{ fontSize: 9, color: "#2a5a4a" }}>Start</span>
          </div>

          <div style={{ color: phase !== "idle" ? "#4cff88" : "#1e3a5a", fontSize: 18, transition: "color 0.4s" }}>→</div>

          {/* Setup task */}
          <div style={{
            background: phase === "setup" ? "#0d2240" : phase !== "idle" ? "#0d2a1a" : "#0a1020",
            border: `2px solid ${phase === "setup" ? scenario.color : phase !== "idle" ? "#4cff88" : "#1a2a4a"}`,
            borderRadius: 10, padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: phase === "setup" ? `0 0 16px ${scenario.color}44` : "none",
            transition: "all 0.4s", flexShrink: 0,
          }}>
            <span style={{ fontSize: 20 }}>{scenario.setupIcon}</span>
            <span style={{ fontSize: 12, color: phase === "setup" ? scenario.color : phase !== "idle" ? "#4cff88" : "#2a4a6a", fontWeight: "bold" }}>
              {scenario.setup}
            </span>
            {phase !== "idle" && phase !== "setup" && <span style={{ fontSize: 10, color: "#4cff88" }}>✓</span>}
          </div>

          <div style={{ color: phase === "waiting" || phase === "fired" ? scenario.color : "#1e3a5a", fontSize: 18, transition: "color 0.4s" }}>→</div>

          {/* Gateway */}
          <GatewaySymbol waiting={phase === "waiting"} color={scenario.color} pulse={phase === "waiting"} />

          {phase === "waiting" && (
            <div style={{
              background: scenario.color + "11", border: `1px dashed ${scenario.color}`,
              borderRadius: 8, padding: "6px 12px", fontSize: 11, color: scenario.color,
              animation: "none",
            }}>
              ⏸ Waiting for first event…
            </div>
          )}
        </div>

        {/* Paths */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scenario.paths.map((path) => (
            <PathRow key={path.id} path={path} state={getPathState(path.id)} scenarioColor={scenario.color} />
          ))}
        </div>
      </div>

      {/* Step Info */}
      <div style={{
        background: "#090e1c",
        border: `1px solid ${info.color}44`,
        borderLeft: `4px solid ${info.color}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#4a6ab5", letterSpacing: 2, textTransform: "uppercase" }}>
            {phase === "idle" ? "Ready" : phase === "setup" ? "Step 1 — Execute" : phase === "waiting" ? "Step 2 — Waiting" : "Step 3 — Event Fired"}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {["idle", "setup", "waiting", "fired"].map((p) => (
              <div key={p} style={{
                width: p === phase ? 16 : 7, height: 7, borderRadius: 4,
                background: p === phase ? info.color : "#1a2a40",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 17, color: "#e8f4ff" }}>{info.title}</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: "#7aacd0", lineHeight: 1.6 }}>{info.desc}</p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
        <button onClick={reset} style={{
          background: "#090e1c", border: "1px solid #1e3a6a",
          borderRadius: 8, color: "#c8dff0", padding: "10px 18px", fontSize: 13, cursor: "pointer",
        }}>↺ Reset</button>

        <button onClick={() => { reset(); setTimeout(() => setAuto(true), 80); }} style={{
          background: auto ? "#1a2a0a" : "#0d1f3a", border: `1px solid ${auto ? "#4cff88" : "#1e3a6a"}`,
          borderRadius: 8, color: auto ? "#4cff88" : "#c8dff0",
          padding: "10px 18px", fontSize: 13, cursor: "pointer",
        }}>{auto ? "▶ Playing…" : "▶ Auto Play"}</button>

        {phase === "idle" && (
          <button onClick={() => setPhase("setup")} style={{
            background: "#0d1f3a", border: `1px solid ${scenario.color}`,
            borderRadius: 8, color: scenario.color, padding: "10px 18px", fontSize: 13, cursor: "pointer",
          }}>Next →</button>
        )}
        {phase === "setup" && (
          <button onClick={() => setPhase("waiting")} style={{
            background: "#0d1f3a", border: `1px solid ${scenario.color}`,
            borderRadius: 8, color: scenario.color, padding: "10px 18px", fontSize: 13, cursor: "pointer",
          }}>Reach Gateway →</button>
        )}
        {phase === "waiting" && (
          <>
            {scenario.paths.map((path) => (
              <button key={path.id} onClick={() => { setFiredPath(path.id); setPhase("fired"); }} style={{
                background: path.color + "11", border: `1px solid ${path.color}`,
                borderRadius: 8, color: path.color, padding: "10px 14px", fontSize: 12, cursor: "pointer",
              }}>{path.icon} Fire: {path.label}</button>
            ))}
            <button onClick={fireRandom} style={{
              background: "#1a1a2a", border: "1px solid #4a4a7a",
              borderRadius: 8, color: "#8a8ab5", padding: "10px 14px", fontSize: 12, cursor: "pointer",
            }}>🎲 Random</button>
          </>
        )}
        {phase === "fired" && (
          <button onClick={reset} style={{
            background: "#0d2a1a", border: "1px solid #4cff88",
            borderRadius: 8, color: "#4cff88", padding: "10px 18px", fontSize: 13, cursor: "pointer",
          }}>↺ Try Again</button>
        )}
      </div>

      {/* Vs Exclusive Gateway */}
      <div style={{ background: "#070c18", border: "1px solid #1a2a4a", borderRadius: 14, padding: "16px", marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#3a5a8a", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
          Event-Based vs Exclusive Gateway
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { title: "Exclusive Gateway", symbol: "✕", color: "#60c8ff", points: ["Decides based on data/conditions", "Decision is immediate", "Followed by tasks or flows", 'Example: "If VIP customer → fast lane"'] },
            { title: "Event-Based Gateway", symbol: "⊙", color: "#ff9944", points: ["Decides based on which event fires first", "Process pauses and waits", "Followed by catching events only", 'Example: "If message arrives → process it"'] },
          ].map((g) => (
            <div key={g.title} style={{ background: "#090e1c", border: `1px solid ${g.color}33`, borderRadius: 10, padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 30, height: 30, background: "#0a1020", border: `2px solid ${g.color}`,
                  borderRadius: 3, transform: "rotate(45deg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ transform: "rotate(-45deg)", fontSize: 11, color: g.color }}>{g.symbol}</span>
                </div>
                <span style={{ fontSize: 12, color: g.color, fontWeight: "bold" }}>{g.title}</span>
              </div>
              {g.points.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "flex-start" }}>
                  <span style={{ color: g.color, fontSize: 10, marginTop: 1, flexShrink: 0 }}>›</span>
                  <span style={{ fontSize: 11, color: "#4a6a8a", lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Key Rules */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a6ab5", textTransform: "uppercase", marginBottom: 10 }}>Key Rules</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
          {[
            { icon: "⏸", rule: "Process pauses at the gateway and waits for an event to occur" },
            { icon: "🥇", rule: "Only the first event to fire wins — all other paths are immediately cancelled" },
            { icon: "📨", rule: "Must always be followed by catching events or receive tasks — never regular tasks" },
            { icon: "👤", rule: "The decision is made by an external participant or system, not by the process" },
            { icon: "⊙", rule: "Identified by a diamond with a double circle (or pentagon) inside" },
          ].map((r) => (
            <div key={r.rule} style={{
              background: "#070c18", border: "1px solid #1a2a4a",
              borderRadius: 10, padding: "12px 14px",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
              <span style={{ fontSize: 12.5, color: "#5a7ab0", lineHeight: 1.5 }}>{r.rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
