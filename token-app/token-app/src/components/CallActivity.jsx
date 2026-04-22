import { useState, useEffect, useRef } from "react";

const steps = [
  {
    id: 0,
    title: "Process Starts",
    description: "The Checkout Process begins. A token is generated at the Start Event and starts moving.",
    tokenMain: "start",
    tokenSub: null,
    activeMain: "start",
    activeSub: null,
    showSubProcess: false,
  },
  {
    id: 1,
    title: "Token Reaches Call Activity",
    description: "The token arrives at the Call Activity — 'Login with Google'. This is a globally defined process that lives outside the current process.",
    tokenMain: "callActivity",
    tokenSub: null,
    activeMain: "callActivity",
    activeSub: null,
    showSubProcess: false,
  },
  {
    id: 2,
    title: "Call Activity Triggers Global Process",
    description: "The Call Activity invokes the external 'Login with Google' process. The token dives into the global process — a brand new sub-token is created there.",
    tokenMain: "callActivity",
    tokenSub: "subStart",
    activeMain: "callActivity",
    activeSub: "subStart",
    showSubProcess: true,
  },
  {
    id: 3,
    title: "Global Process: Enter Credentials",
    description: "Inside the global Login process, the first task executes — the user enters their Google credentials.",
    tokenMain: "callActivity",
    tokenSub: "subTask1",
    activeMain: "callActivity",
    activeSub: "subTask1",
    showSubProcess: true,
  },
  {
    id: 4,
    title: "Global Process: Verify Identity",
    description: "The second task runs — Google verifies the identity of the user.",
    tokenMain: "callActivity",
    tokenSub: "subTask2",
    activeMain: "callActivity",
    activeSub: "subTask2",
    showSubProcess: true,
  },
  {
    id: 5,
    title: "Global Process: Grant Access",
    description: "The final task in the global process runs — access is granted and the session is created.",
    tokenMain: "callActivity",
    tokenSub: "subTask3",
    activeMain: "callActivity",
    activeSub: "subTask3",
    showSubProcess: true,
  },
  {
    id: 6,
    title: "Global Process Ends — Token Returns",
    description: "The Login process completes. The sub-token is consumed, and control returns to the original Checkout Process. The main token is released.",
    tokenMain: "callActivity",
    tokenSub: "subEnd",
    activeMain: "callActivity",
    activeSub: "subEnd",
    showSubProcess: true,
  },
  {
    id: 7,
    title: "Checkout Continues",
    description: "Back in the Checkout Process, the token moves on to the next task — Select Payment Method.",
    tokenMain: "taskB",
    tokenSub: null,
    activeMain: "taskB",
    activeSub: null,
    showSubProcess: false,
  },
  {
    id: 8,
    title: "Process Completes",
    description: "The token reaches the End Event. The Checkout Process is complete. The Call Activity was reused without redefining its steps!",
    tokenMain: "end",
    tokenSub: null,
    activeMain: "end",
    activeSub: null,
    showSubProcess: false,
  },
];

const mainNodes = {
  start: { x: 80, y: 80 },
  callActivity: { x: 220, y: 60 },
  taskB: { x: 370, y: 60 },
  end: { x: 500, y: 80 },
};

const subNodes = {
  subStart: { x: 60, y: 75 },
  subTask1: { x: 160, y: 58 },
  subTask2: { x: 280, y: 58 },
  subTask3: { x: 400, y: 58 },
  subEnd: { x: 500, y: 75 },
};

function Token({ x, y, color = "#FFD700" }) {
  return (
    <g>
      <circle cx={x} cy={y} r={13} fill={color} opacity={0.2}>
        <animate attributeName="r" values="13;19;13" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={8} fill={color} stroke={color === "#FFD700" ? "#cc8800" : "#0088cc"} strokeWidth={2} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="8" fill={color === "#FFD700" ? "#6a3a00" : "#003366"} fontWeight="bold">T</text>
    </g>
  );
}

export default function CallActivity() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (auto) {
      timerRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= steps.length - 1) { setAuto(false); return s; }
          return s + 1;
        });
      }, 2200);
    }
    return () => clearInterval(timerRef.current);
  }, [auto]);

  const cur = steps[step];

  const mainActive = (id) => cur.activeMain === id;
  const subActive = (id) => cur.activeSub === id;

  const taskRect = (active, bold = false) => ({
    fill: active ? "#1a3a5a" : "#0d1f33",
    stroke: active ? "#60c8ff" : bold ? "#60c8ff" : "#1e4a7a",
    strokeWidth: bold ? (active ? 4 : 3) : (active ? 2.5 : 1.5),
    filter: active ? "url(#glow)" : "none",
    rx: 8, ry: 8,
  });

  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "linear-gradient(135deg, #06101a 0%, #0a1828 60%, #081420 100%)",
      minHeight: "100vh",
      color: "#c8dff0",
      padding: "28px 20px",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#4a8ab5", textTransform: "uppercase", marginBottom: 6 }}>BPMN Concept</div>
        <h1 style={{ margin: 0, fontSize: 26, color: "#e8f4ff", letterSpacing: 1 }}>Call Activity</h1>
        <p style={{ margin: "8px auto 0", color: "#5a90b8", fontSize: 13, maxWidth: 480 }}>
          Watch how a Call Activity invokes a reusable global process and returns control
        </p>
      </div>

      {/* Main Process */}
      <div style={{ background: "#0a1828", border: "1px solid #1a3a5a", borderRadius: 14, padding: "16px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: "#4a8ab5", textTransform: "uppercase", marginBottom: 8 }}>
          📦 Checkout Process (Main)
        </div>
        <svg viewBox="0 0 580 140" style={{ width: "100%", maxHeight: 140 }}>
          <defs>
            <filter id="glow">
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

          {/* Pool */}
          <rect x="10" y="20" width="560" height="110" rx="10" fill="#0d1f33" stroke="#1a3a5a" strokeWidth="1.5" />

          {/* Flows */}
          <line x1="100" y1="80" x2="170" y2="80" stroke={cur.tokenMain === "callActivity" || cur.activeMain === "callActivity" ? "#FFD700" : "#2a5a8a"} strokeWidth="1.5" markerEnd={cur.tokenMain === "callActivity" ? "url(#arrowGold)" : "url(#arrow)"} />
          <line x1="310" y1="80" x2="340" y2="80" stroke={cur.tokenMain === "taskB" ? "#FFD700" : "#2a5a8a"} strokeWidth="1.5" markerEnd={cur.tokenMain === "taskB" ? "url(#arrowGold)" : "url(#arrow)"} />
          <line x1="460" y1="80" x2="480" y2="80" stroke={cur.tokenMain === "end" ? "#FFD700" : "#2a5a8a"} strokeWidth="1.5" markerEnd={cur.tokenMain === "end" ? "url(#arrowGold)" : "url(#arrow)"} />

          {/* Start */}
          <circle cx={80} cy={80} r={20} fill={mainActive("start") ? "#1a3a1a" : "#0d1f33"}
            stroke={mainActive("start") ? "#4cff88" : "#2a7a4a"} strokeWidth={mainActive("start") ? 2.5 : 1.5}
            filter={mainActive("start") ? "url(#glow)" : "none"} />
          <text x={80} y={85} textAnchor="middle" fontSize="14" fill={mainActive("start") ? "#4cff88" : "#2a7a4a"}>▶</text>
          <text x={80} y={118} textAnchor="middle" fontSize="9" fill="#3a6a5a">Start</text>

          {/* Call Activity — bold border */}
          <rect x={170} y={55} width={140} height={50} {...taskRect(mainActive("callActivity"), true)} />
          {/* Bold border indicator */}
          <rect x={170} y={55} width={140} height={50} rx={8} ry={8} fill="none"
            stroke={mainActive("callActivity") ? "#60c8ff" : "#3a7aaa"} strokeWidth={mainActive("callActivity") ? 4 : 3} />
          <text x={240} y={76} textAnchor="middle" fontSize="10" fill={mainActive("callActivity") ? "#60c8ff" : "#4a8ab5"} fontWeight="bold">Login with</text>
          <text x={240} y={91} textAnchor="middle" fontSize="10" fill={mainActive("callActivity") ? "#60c8ff" : "#4a8ab5"} fontWeight="bold">Google ↗</text>
          <text x={240} y={118} textAnchor="middle" fontSize="9" fill="#3a6a8a">Call Activity</text>

          {/* Task B */}
          <rect x={340} y={55} width={120} height={50} {...taskRect(mainActive("taskB"))} />
          <text x={400} y={76} textAnchor="middle" fontSize="10" fill={mainActive("taskB") ? "#60c8ff" : "#4a8ab5"} fontWeight="bold">Select Payment</text>
          <text x={400} y={91} textAnchor="middle" fontSize="10" fill={mainActive("taskB") ? "#60c8ff" : "#4a8ab5"} fontWeight="bold">Method</text>

          {/* End */}
          <circle cx={500} cy={80} r={20} fill={mainActive("end") ? "#3a0d0d" : "#0d1f33"}
            stroke={mainActive("end") ? "#ff4c4c" : "#7a2a2a"} strokeWidth={mainActive("end") ? 3 : 2}
            filter={mainActive("end") ? "url(#glow)" : "none"} />
          <circle cx={500} cy={80} r={14} fill="none" stroke={mainActive("end") ? "#ff4c4c" : "#7a2a2a"} strokeWidth={mainActive("end") ? 2 : 1.5} />
          <text x={500} y={118} textAnchor="middle" fontSize="9" fill="#7a4a4a">End</text>

          {/* Main Token */}
          {cur.tokenMain && !cur.showSubProcess && (
            <Token x={mainNodes[cur.tokenMain]?.x} y={mainNodes[cur.tokenMain]?.y} color="#FFD700" />
          )}
          {cur.tokenMain && cur.showSubProcess && (
            <Token x={mainNodes["callActivity"].x} y={mainNodes["callActivity"].y} color="#FFD700" />
          )}
        </svg>
      </div>

      {/* Global Process */}
      <div style={{
        background: cur.showSubProcess ? "#081a2e" : "#060f1a",
        border: `1px solid ${cur.showSubProcess ? "#1a5a3a" : "#111a24"}`,
        borderRadius: 14,
        padding: "16px",
        marginBottom: 14,
        transition: "all 0.4s",
        opacity: cur.showSubProcess ? 1 : 0.35,
      }}>
        <div style={{ fontSize: 10, letterSpacing: 3, color: cur.showSubProcess ? "#4ab58a" : "#2a4a5a", textTransform: "uppercase", marginBottom: 8 }}>
          🌐 Login with Google (Global Process) {cur.showSubProcess ? "— ACTIVE" : "— on standby"}
        </div>
        <svg viewBox="0 0 580 130" style={{ width: "100%", maxHeight: 130 }}>
          <defs>
            <marker id="arrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#1a5a3a" />
            </marker>
            <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#00aaff" />
            </marker>
          </defs>

          <rect x="10" y="15" width="560" height="100" rx="10" fill="#091a12" stroke={cur.showSubProcess ? "#1a5a3a" : "#0d2a1a"} strokeWidth="1.5" />

          {/* Flows */}
          {[
            { x1: 80, x2: 110 }, { x1: 210, x2: 240 }, { x1: 340, x2: 370 }, { x1: 460, x2: 480 }
          ].map((f, i) => {
            const nodes = ["subTask1", "subTask2", "subTask3", "subEnd"];
            const active = cur.tokenSub === nodes[i];
            return <line key={i} x1={f.x1} y1={75} x2={f.x2} y2={75}
              stroke={active ? "#00aaff" : "#1a5a3a"} strokeWidth={active ? 2 : 1.5}
              markerEnd={active ? "url(#arrowBlue)" : "url(#arrow2)"} />;
          })}

          {/* Sub Start */}
          <circle cx={60} cy={75} r={18} fill={subActive("subStart") ? "#1a3a1a" : "#091a12"}
            stroke={subActive("subStart") ? "#4cff88" : "#1a5a3a"} strokeWidth="1.5"
            filter={subActive("subStart") ? "url(#glow)" : "none"} />
          <text x={60} y={80} textAnchor="middle" fontSize="12" fill={subActive("subStart") ? "#4cff88" : "#1a5a3a"}>▶</text>

          {/* Sub Tasks */}
          {[
            { x: 110, label1: "Enter", label2: "Credentials", id: "subTask1" },
            { x: 240, label1: "Verify", label2: "Identity", id: "subTask2" },
            { x: 370, label1: "Grant", label2: "Access", id: "subTask3" },
          ].map((t) => (
            <g key={t.id}>
              <rect x={t.x} y={55} width={100} height={40} rx={7} ry={7}
                fill={subActive(t.id) ? "#0d2a1a" : "#091a12"}
                stroke={subActive(t.id) ? "#00aaff" : "#1a5a3a"}
                strokeWidth={subActive(t.id) ? 2.5 : 1.5}
                filter={subActive(t.id) ? "url(#glow)" : "none"} />
              <text x={t.x + 50} y={72} textAnchor="middle" fontSize="10"
                fill={subActive(t.id) ? "#00aaff" : "#2a8a5a"} fontWeight="bold">{t.label1}</text>
              <text x={t.x + 50} y={85} textAnchor="middle" fontSize="10"
                fill={subActive(t.id) ? "#00aaff" : "#2a8a5a"} fontWeight="bold">{t.label2}</text>
            </g>
          ))}

          {/* Sub End */}
          <circle cx={500} cy={75} r={18} fill={subActive("subEnd") ? "#3a0d0d" : "#091a12"}
            stroke={subActive("subEnd") ? "#ff4c4c" : "#5a2a2a"} strokeWidth={subActive("subEnd") ? 3 : 2}
            filter={subActive("subEnd") ? "url(#glow)" : "none"} />
          <circle cx={500} cy={75} r={12} fill="none"
            stroke={subActive("subEnd") ? "#ff4c4c" : "#5a2a2a"} strokeWidth={subActive("subEnd") ? 2 : 1.5} />

          {/* Sub Token */}
          {cur.tokenSub && (
            <Token x={subNodes[cur.tokenSub]?.x} y={subNodes[cur.tokenSub]?.y} color="#00aaff" />
          )}
        </svg>
      </div>

      {/* Step Card */}
      <div style={{
        background: "linear-gradient(135deg, #0d1f33, #091828)",
        border: "1px solid #1a3a5a",
        borderLeft: "4px solid #60c8ff",
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#4a8ab5", letterSpacing: 2, textTransform: "uppercase" }}>
            Step {step + 1} of {steps.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {steps.map((_, i) => (
              <div key={i} onClick={() => setStep(i)} style={{
                width: i === step ? 18 : 8, height: 8, borderRadius: 4,
                background: i === step ? "#60c8ff" : i < step ? "#2a5a8a" : "#1a3040",
                cursor: "pointer", transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 17, color: "#e8f4ff" }}>{cur.title}</h2>
        <p style={{ margin: 0, fontSize: 13.5, color: "#7aacd0", lineHeight: 1.6 }}>{cur.description}</p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
        {[
          { label: "← Prev", onClick: () => { setAuto(false); setStep(s => Math.max(0, s - 1)); }, disabled: step === 0 },
          { label: "↺ Reset", onClick: () => { setAuto(false); setStep(0); }, disabled: false },
          { label: auto ? "▶ Playing..." : "▶ Auto Play", onClick: () => { setStep(0); setAuto(true); }, disabled: false, gold: auto },
          { label: "Next →", onClick: () => { setAuto(false); setStep(s => Math.min(steps.length - 1, s + 1)); }, disabled: step === steps.length - 1 },
        ].map((b) => (
          <button key={b.label} onClick={b.onClick} disabled={b.disabled} style={{
            background: b.disabled ? "#0d1f33" : b.gold ? "#1a3a1a" : "#1a3a5a",
            border: `1px solid ${b.gold ? "#4cff88" : "#2a5a8a"}`,
            borderRadius: 8, color: b.disabled ? "#2a4a6a" : b.gold ? "#4cff88" : "#c8dff0",
            padding: "10px 20px", fontSize: 13, cursor: b.disabled ? "not-allowed" : "pointer",
          }}>{b.label}</button>
        ))}
      </div>

      {/* Key Rules */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a8ab5", textTransform: "uppercase", marginBottom: 10 }}>Key Rules</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
          {[
            { icon: "🔲", rule: "Identified by a bold/thick border around the task box" },
            { icon: "🌐", rule: "Calls a process defined globally — outside the current process" },
            { icon: "♻️", rule: "The same global process can be reused across many processes" },
            { icon: "🔵", rule: "A new token is created inside the called process" },
            { icon: "↩️", rule: "When the global process ends, control returns to the original process" },
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
