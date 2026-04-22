import { useState, useEffect, useRef } from "react";

const steps = [
  {
    id: 0,
    title: "Process is Called",
    description: "A process instance is created. Nothing is moving yet — the token is about to be born.",
    tokenPos: null,
    activeNode: null,
    highlight: "start",
  },
  {
    id: 1,
    title: "Start Event Generates a Token",
    description: "The Start Event fires and creates a token — think of it as a virtual marble dropped into the process.",
    tokenPos: "start",
    activeNode: "start",
    highlight: "start",
  },
  {
    id: 2,
    title: "Token Travels via Sequence Flow",
    description: "The token moves along the sequence flow arrow toward the first activity.",
    tokenPos: "flow1",
    activeNode: null,
    highlight: "flow1",
  },
  {
    id: 3,
    title: "Token Touches Activity A → Executes",
    description: "When the token arrives at an activity, that activity begins execution. The token waits inside until the activity is done.",
    tokenPos: "taskA",
    activeNode: "taskA",
    highlight: "taskA",
  },
  {
    id: 4,
    title: "Token Moves to Next Flow",
    description: "Activity A completes. The token is released and travels along the next sequence flow.",
    tokenPos: "flow2",
    activeNode: null,
    highlight: "flow2",
  },
  {
    id: 5,
    title: "Token Touches Activity B → Executes",
    description: "The token arrives at Activity B, triggering its execution.",
    tokenPos: "taskB",
    activeNode: "taskB",
    highlight: "taskB",
  },
  {
    id: 6,
    title: "Token Reaches the End Event",
    description: "The token exits the last activity and arrives at the End Event.",
    tokenPos: "flow3",
    activeNode: null,
    highlight: "flow3",
  },
  {
    id: 7,
    title: "Token is Consumed — Process Ends",
    description: "The End Event consumes the token. The process instance is complete. No more tokens remain.",
    tokenPos: "end",
    activeNode: "end",
    highlight: "end",
  },
];

const nodePositions = {
  start: { x: 60, y: 110 },
  flow1: { x: 155, y: 110 },
  taskA: { x: 230, y: 85 },
  flow2: { x: 335, y: 110 },
  taskB: { x: 410, y: 85 },
  flow3: { x: 515, y: 110 },
  end: { x: 565, y: 110 },
};

function TokenMarble({ pos }) {
  if (!pos) return null;
  const p = nodePositions[pos];
  return (
    <g>
      <circle cx={p.x} cy={p.y} r={14} fill="#FFD700" opacity={0.25} >
        <animate attributeName="r" values="14;20;14" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.25;0.05;0.25" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <circle cx={p.x} cy={p.y} r={9} fill="#FFD700" stroke="#FFA500" strokeWidth={2} />
      <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="9" fill="#7a4a00" fontWeight="bold">T</text>
    </g>
  );
}

export default function TokenGeneration() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (auto) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= steps.length - 1) { setAuto(false); return s; }
          return s + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timerRef.current ?? undefined);
  }, [auto]);

  const current = steps[step];

  const isActive = (id) => current.activeNode === id;
  const isHighlight = (id) => current.highlight === id;

  const taskStyle = (id) => ({
    rx: 8,
    ry: 8,
    fill: isActive(id) ? "#1e3a5f" : "#0f2236",
    stroke: isActive(id) ? "#60c8ff" : "#1e4a7a",
    strokeWidth: isActive(id) ? 2.5 : 1.5,
    filter: isActive(id) ? "url(#glow)" : "none",
  });

  const flowColor = (id) => (isHighlight(id) ? "#FFD700" : "#2a5a8a");

  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "linear-gradient(135deg, #060e1a 0%, #0a1828 50%, #091422 100%)",
      minHeight: "100vh",
      color: "#c8dff0",
      padding: "32px 24px",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#4a8ab5", textTransform: "uppercase", marginBottom: 6 }}>BPMN Concept</div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: "bold", color: "#e8f4ff", letterSpacing: 1 }}>
          Token Generation
        </h1>
        <p style={{ margin: "8px auto 0", color: "#5a90b8", fontSize: 14, maxWidth: 460 }}>
          Watch how a token travels through a BPMN process, step by step
        </p>
      </div>

      {/* BPMN Diagram */}
      <div style={{ background: "#0a1828", border: "1px solid #1a3a5a", borderRadius: 16, padding: "20px 16px", marginBottom: 24 }}>
        <svg viewBox="0 0 630 200" style={{ width: "100%", maxHeight: 200 }}>
          <defs>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#2a5a8a" />
            </marker>
            <marker id="arrowGold" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#FFD700" />
            </marker>
          </defs>

          {/* Pool background */}
          <rect x="10" y="30" width="610" height="155" rx="10" fill="#0d1f33" stroke="#1a3a5a" strokeWidth="1.5" />
          <rect x="10" y="30" width="80" height="155" rx="10" fill="#091522" stroke="#1a3a5a" strokeWidth="1.5" />
          <text x="50" y="118" textAnchor="middle" fontSize="11" fill="#3a7aaa" fontWeight="bold"
            transform="rotate(-90, 50, 118)">PROCESS</text>

          {/* Sequence Flows */}
          {/* flow1: start → taskA */}
          <line x1="80" y1="110" x2="200" y2="110"
            stroke={flowColor("flow1")} strokeWidth={isHighlight("flow1") ? 2.5 : 1.5}
            markerEnd={isHighlight("flow1") ? "url(#arrowGold)" : "url(#arrow)"} />

          {/* flow2: taskA → taskB */}
          <line x1="302" y1="110" x2="380" y2="110"
            stroke={flowColor("flow2")} strokeWidth={isHighlight("flow2") ? 2.5 : 1.5}
            markerEnd={isHighlight("flow2") ? "url(#arrowGold)" : "url(#arrow)"} />

          {/* flow3: taskB → end */}
          <line x1="484" y1="110" x2="546" y2="110"
            stroke={flowColor("flow3")} strokeWidth={isHighlight("flow3") ? 2.5 : 1.5}
            markerEnd={isHighlight("flow3") ? "url(#arrowGold)" : "url(#arrow)"} />

          {/* START EVENT */}
          <circle cx={60} cy={110} r={20}
            fill={isActive("start") ? "#1a3a1a" : "#0d1f33"}
            stroke={isActive("start") ? "#4cff88" : "#2a7a4a"}
            strokeWidth={isActive("start") ? 2.5 : 1.5}
            filter={isActive("start") ? "url(#glow)" : "none"} />
          <text x={60} y={115} textAnchor="middle" fontSize="14" fill={isActive("start") ? "#4cff88" : "#2a7a4a"}>▶</text>
          <text x={60} y={148} textAnchor="middle" fontSize="9.5" fill="#4a7a6a">Start</text>

          {/* TASK A */}
          <rect x={201} y={85} width={100} height={50} {...taskStyle("taskA")} />
          <text x={251} y={113} textAnchor="middle" fontSize="11" fill={isActive("taskA") ? "#60c8ff" : "#4a8ab5"} fontWeight="bold">
            Activity A
          </text>
          <text x={251} y={152} textAnchor="middle" fontSize="9.5" fill="#3a6a8a">Review Request</text>

          {/* TASK B */}
          <rect x={381} y={85} width={100} height={50} {...taskStyle("taskB")} />
          <text x={431} y={113} textAnchor="middle" fontSize="11" fill={isActive("taskB") ? "#60c8ff" : "#4a8ab5"} fontWeight="bold">
            Activity B
          </text>
          <text x={431} y={152} textAnchor="middle" fontSize="9.5" fill="#3a6a8a">Approve Request</text>

          {/* END EVENT */}
          <circle cx={565} cy={110} r={20}
            fill={isActive("end") ? "#3a0d0d" : "#0d1f33"}
            stroke={isActive("end") ? "#ff4c4c" : "#7a2a2a"}
            strokeWidth={isActive("end") ? 3 : 2}
            filter={isActive("end") ? "url(#glow)" : "none"} />
          <circle cx={565} cy={110} r={14}
            fill="none"
            stroke={isActive("end") ? "#ff4c4c" : "#7a2a2a"}
            strokeWidth={isActive("end") ? 2 : 1.5} />
          <text x={565} y={148} textAnchor="middle" fontSize="9.5" fill="#7a4a4a">End</text>

          {/* TOKEN */}
          <TokenMarble pos={current.tokenPos} />
        </svg>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
          {[
            { color: "#4cff88", label: "Start Event" },
            { color: "#60c8ff", label: "Active Task" },
            { color: "#ff4c4c", label: "End Event" },
            { color: "#FFD700", label: "Token 🪙" },
            { color: "#FFD700", label: "Active Flow", dashed: true },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#5a90b8" }}>
              <div style={{
                width: 20, height: l.dashed ? 2 : 10,
                background: l.color,
                borderRadius: l.dashed ? 0 : 3,
                borderTop: l.dashed ? `2px dashed ${l.color}` : "none",
              }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Step Info Card */}
      <div style={{
        background: "linear-gradient(135deg, #0d1f33, #091828)",
        border: "1px solid #1a3a5a",
        borderLeft: "4px solid #FFD700",
        borderRadius: 12,
        padding: "18px 20px",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#4a8ab5", letterSpacing: 2, textTransform: "uppercase" }}>
            Step {step + 1} of {steps.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {steps.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} style={{
                width: i === step ? 18 : 8, height: 8,
                borderRadius: 4,
                background: i === step ? "#FFD700" : i < step ? "#2a5a8a" : "#1a3040",
                cursor: "pointer",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, color: "#e8f4ff", fontWeight: "bold" }}>
          {current.title}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "#7aacd0", lineHeight: 1.6 }}>
          {current.description}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button
          onClick={() => { setAuto(false); setStep((s) => Math.max(0, s - 1)); }}
          disabled={step === 0}
          style={{
            background: step === 0 ? "#0d1f33" : "#1a3a5a",
            border: "1px solid #2a5a8a", borderRadius: 8,
            color: step === 0 ? "#2a4a6a" : "#c8dff0",
            padding: "10px 20px", fontSize: 13, cursor: step === 0 ? "not-allowed" : "pointer",
          }}>← Prev</button>

        <button
          onClick={() => { setAuto(false); setStep(0); }}
          style={{
            background: "#0d1f33", border: "1px solid #2a5a8a",
            borderRadius: 8, color: "#7aacd0",
            padding: "10px 20px", fontSize: 13, cursor: "pointer",
          }}>↺ Reset</button>

        <button
          onClick={() => { setStep(0); setAuto(true); }}
          style={{
            background: auto ? "#1a3a1a" : "#1a3a5a",
            border: `1px solid ${auto ? "#4cff88" : "#2a5a8a"}`,
            borderRadius: 8, color: auto ? "#4cff88" : "#c8dff0",
            padding: "10px 20px", fontSize: 13, cursor: "pointer",
          }}>{auto ? "▶ Playing..." : "▶ Auto Play"}</button>

        <button
          onClick={() => { setAuto(false); setStep((s) => Math.min(steps.length - 1, s + 1)); }}
          disabled={step === steps.length - 1}
          style={{
            background: step === steps.length - 1 ? "#0d1f33" : "#1a3a5a",
            border: "1px solid #2a5a8a", borderRadius: 8,
            color: step === steps.length - 1 ? "#2a4a6a" : "#c8dff0",
            padding: "10px 20px", fontSize: 13, cursor: step === steps.length - 1 ? "not-allowed" : "pointer",
          }}>Next →</button>
      </div>

      {/* Key Rules */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a8ab5", textTransform: "uppercase", marginBottom: 12 }}>Key Rules</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {[
            { icon: "🪙", rule: "One token is created per process instance at the Start Event" },
            { icon: "➡️", rule: "Tokens travel only along Sequence Flows, never Message Flows" },
            { icon: "🚧", rule: "Tokens cannot cross Pool boundaries" },
            { icon: "⚡", rule: "An activity executes only when a token touches it" },
            { icon: "🔚", rule: "The End Event consumes the token, ending the process" },
          ].map((r) => (
            <div key={r.rule} style={{
              background: "#0a1828", border: "1px solid #1a3a5a",
              borderRadius: 10, padding: "12px 14px",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
              <span style={{ fontSize: 12.5, color: "#7aacd0", lineHeight: 1.5 }}>{r.rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
