import { useState, useEffect, useRef } from "react";

const SCENARIOS = [
  {
    name: "Flight Booking",
    icon: "✈️",
    color: "#60c8ff",
    steps: [
      {
        id: "start",
        label: "Start",
        type: "start",
        description: "A customer initiates a flight booking process.",
        phase: "forward",
      },
      {
        id: "book",
        label: "Book Flight",
        icon: "✈️",
        type: "task",
        description: "Flight seat is reserved in the airline system. Task completes successfully.",
        phase: "forward",
      },
      {
        id: "charge",
        label: "Charge Card",
        icon: "💳",
        type: "task",
        description: "Customer's card is charged for the ticket. Task completes successfully.",
        phase: "forward",
      },
      {
        id: "issue",
        label: "Issue Ticket",
        icon: "🎫",
        type: "task",
        description: "System attempts to issue the ticket — but fails due to an airline error!",
        phase: "forward",
        fails: true,
      },
      {
        id: "throw",
        label: "Compensation\nThrow",
        icon: "⚡",
        type: "throw",
        description: "A Compensation Throw Event is triggered, signaling that completed steps must be undone.",
        phase: "compensate",
      },
      {
        id: "undo_charge",
        label: "Refund Card",
        icon: "💳↩",
        type: "compensate",
        description: "Compensation handler reverses the card charge — the customer is refunded.",
        phase: "compensate",
        undoes: "charge",
      },
      {
        id: "undo_book",
        label: "Cancel Booking",
        icon: "✈️↩",
        type: "compensate",
        description: "Compensation handler cancels the flight reservation — the seat is released.",
        phase: "compensate",
        undoes: "book",
      },
      {
        id: "end",
        label: "End",
        type: "end",
        description: "Process ends. All completed steps have been successfully reversed.",
        phase: "compensate",
      },
    ],
  },
  {
    name: "Online Order",
    icon: "🛒",
    color: "#4cff88",
    steps: [
      {
        id: "start",
        label: "Start",
        type: "start",
        description: "Customer places an online order.",
        phase: "forward",
      },
      {
        id: "reserve",
        label: "Reserve Stock",
        icon: "📦",
        type: "task",
        description: "Items are reserved in the warehouse inventory. Task completes successfully.",
        phase: "forward",
      },
      {
        id: "charge",
        label: "Charge Customer",
        icon: "💳",
        type: "task",
        description: "Payment is collected from the customer. Task completes successfully.",
        phase: "forward",
      },
      {
        id: "ship",
        label: "Ship Order",
        icon: "🚚",
        type: "task",
        description: "Shipping is attempted — but the delivery address is invalid. Failure!",
        phase: "forward",
        fails: true,
      },
      {
        id: "throw",
        label: "Compensation\nThrow",
        icon: "⚡",
        type: "throw",
        description: "Compensation Throw Event fires — completed tasks must be undone.",
        phase: "compensate",
      },
      {
        id: "undo_charge",
        label: "Refund Payment",
        icon: "💳↩",
        type: "compensate",
        description: "Customer payment is refunded in full.",
        phase: "compensate",
        undoes: "charge",
      },
      {
        id: "undo_reserve",
        label: "Release Stock",
        icon: "📦↩",
        type: "compensate",
        description: "Reserved inventory items are released back to stock.",
        phase: "compensate",
        undoes: "reserve",
      },
      {
        id: "end",
        label: "End",
        type: "end",
        description: "Process ends cleanly. No money taken, no stock held.",
        phase: "compensate",
      },
    ],
  },
  {
    name: "Bank Transfer",
    icon: "🏦",
    color: "#ff9944",
    steps: [
      {
        id: "start",
        label: "Start",
        type: "start",
        description: "A bank transfer between two accounts is initiated.",
        phase: "forward",
      },
      {
        id: "debit",
        label: "Debit Account A",
        icon: "🏦",
        type: "task",
        description: "Funds are debited from Account A. Task completes successfully.",
        phase: "forward",
      },
      {
        id: "credit",
        label: "Credit Account B",
        icon: "💰",
        type: "task",
        description: "Credit to Account B fails — the account has been frozen!",
        phase: "forward",
        fails: true,
      },
      {
        id: "throw",
        label: "Compensation\nThrow",
        icon: "⚡",
        type: "throw",
        description: "Compensation Throw Event fires to reverse the completed debit.",
        phase: "compensate",
      },
      {
        id: "undo_debit",
        label: "Restore Debit",
        icon: "🏦↩",
        type: "compensate",
        description: "The debit from Account A is reversed — funds are restored.",
        phase: "compensate",
        undoes: "debit",
      },
      {
        id: "end",
        label: "End",
        type: "end",
        description: "Transfer cancelled. Account A balance fully restored.",
        phase: "compensate",
      },
    ],
  },
];

function Token({ color = "#FFD700" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 22, height: 22, borderRadius: "50%",
      background: color, border: `2px solid ${color === "#FFD700" ? "#cc8800" : "#cc4400"}`,
      fontSize: 9, fontWeight: "bold", color: color === "#FFD700" ? "#6a3a00" : "#fff",
      boxShadow: `0 0 10px ${color}88`,
      flexShrink: 0,
    }}>T</span>
  );
}

function StepNode({ step, state, scenarioColor }) {
  // state: idle | active | done | failed | compensating | compensated
  const colors = {
    idle:         { bg: "#0a1020", border: "#1a2a4a", text: "#2a4a6a", glow: false },
    active:       { bg: "#0d2240", border: scenarioColor, text: scenarioColor, glow: true },
    done:         { bg: "#0d2a1a", border: "#4cff88", text: "#4cff88", glow: false },
    failed:       { bg: "#2a0d0d", border: "#ff4c4c", text: "#ff4c4c", glow: true },
    compensating: { bg: "#2a1500", border: "#ff9944", text: "#ff9944", glow: true },
    compensated:  { bg: "#1a0d00", border: "#7a4a1a", text: "#7a4a1a", glow: false },
  };
  const c = colors[state] || colors.idle;

  if (step.type === "start" || step.type === "end") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: c.bg, border: `2px solid ${c.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
          boxShadow: c.glow ? `0 0 16px ${c.border}66` : "none",
          transition: "all 0.4s",
          position: "relative",
        }}>
          {step.type === "end" && (
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              border: `2px solid ${c.border}`,
              position: "absolute",
            }} />
          )}
          <span style={{ fontSize: step.type === "start" ? 14 : 10, color: c.text }}>
            {step.type === "start" ? "▶" : "■"}
          </span>
        </div>
        <span style={{ fontSize: 9, color: c.text, letterSpacing: 1 }}>{step.label}</span>
      </div>
    );
  }

  if (step.type === "throw") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "#2a0d0d", border: "2px solid #ff4c4c",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: state === "active" ? "0 0 18px #ff4c4c66" : "none",
          transition: "all 0.4s",
        }}>
          <div style={{
            width: 33, height: 33, borderRadius: "50%",
            border: "2px solid #ff4c4c",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: "#ff4c4c",
          }}>⚡</div>
        </div>
        <span style={{ fontSize: 8.5, color: state === "active" ? "#ff4c4c" : "#5a2a2a", textAlign: "center", maxWidth: 60 }}>
          Compensation Throw
        </span>
      </div>
    );
  }

  if (step.type === "compensate") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{
          width: 90, height: 44,
          background: state === "active" || state === "compensating" ? "#2a1500" : state === "compensated" ? "#1a0d00" : "#0a0800",
          border: `2px solid ${state === "active" || state === "compensating" ? "#ff9944" : state === "compensated" ? "#7a4a1a" : "#2a1a08"}`,
          borderRadius: 8,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: (state === "active" || state === "compensating") ? "0 0 16px #ff994466" : "none",
          transition: "all 0.4s",
        }}>
          <span style={{ fontSize: 11, color: state === "active" || state === "compensating" ? "#ff9944" : state === "compensated" ? "#7a4a1a" : "#2a1a08" }}>
            {step.icon}
          </span>
          <span style={{ fontSize: 9, color: state === "active" || state === "compensating" ? "#ff9944" : state === "compensated" ? "#7a4a1a" : "#2a1a08", textAlign: "center", lineHeight: 1.3 }}>
            {step.label}
          </span>
        </div>
        <span style={{ fontSize: 8, color: "#5a3a1a", letterSpacing: 1 }}>UNDO TASK</span>
      </div>
    );
  }

  // Regular task
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 90, height: 44,
        background: c.bg, border: `2px solid ${c.border}`,
        borderRadius: 8,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        boxShadow: c.glow ? `0 0 16px ${c.border}55` : "none",
        transition: "all 0.4s",
        position: "relative",
      }}>
        {state === "done" && <div style={{ position: "absolute", top: 3, right: 6, fontSize: 9, color: "#4cff88" }}>✓</div>}
        {state === "failed" && <div style={{ position: "absolute", top: 3, right: 6, fontSize: 9, color: "#ff4c4c" }}>✗</div>}
        {state === "compensated" && <div style={{ position: "absolute", top: 3, right: 6, fontSize: 9, color: "#7a4a1a" }}>↩</div>}
        <span style={{ fontSize: 13 }}>{step.icon}</span>
        <span style={{ fontSize: 9.5, color: c.text, textAlign: "center", fontWeight: "bold" }}>{step.label}</span>
      </div>
    </div>
  );
}

export default function CompensationActivity() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(-1);
  const [auto, setAuto] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | null>(null);
  const scenario = SCENARIOS[scenarioIdx];

  useEffect(() => {
    if (auto) {
      timerRef.current = setInterval(() => {
        setStepIdx((s) => {
          const next = s + 1;
          if (next >= scenario.steps.length) { setAuto(false); setDone(true); return s; }
          return next;
        });
      }, 1800);
    }
    return () => clearInterval(timerRef.current ?? undefined);
  }, [auto, scenario]);

  const reset = () => { setStepIdx(-1); setAuto(false); setDone(false); };
  const switchScenario = (i) => { setScenarioIdx(i); reset(); };

  const getState = (step) => {
    if (stepIdx < 0) return "idle";
    const cur = scenario.steps[stepIdx];

    if (step.type === "throw") {
      if (cur.id === "throw") return "active";
      const throwIdx = scenario.steps.findIndex(s => s.type === "throw");
      if (stepIdx > throwIdx) return "done";
      return "idle";
    }

    if (step.id === cur.id) {
      if (step.fails) return "failed";
      if (step.type === "compensate") return "compensating";
      return "active";
    }

    const throwIdx = scenario.steps.findIndex(s => s.type === "throw");
    const myIdx = scenario.steps.findIndex(s => s.id === step.id);

    if (myIdx < stepIdx) {
      if (step.type === "task") {
        // check if it was compensated
        const compensateStep = scenario.steps.find(s => s.undoes === step.id);
        if (compensateStep) {
          const compIdx = scenario.steps.findIndex(s => s.id === compensateStep.id);
          if (compIdx <= stepIdx) return "compensated";
        }
        if (step.fails) return "failed";
        return "done";
      }
      if (step.type === "compensate") return "compensated";
      if (step.type === "start") return "done";
    }
    return "idle";
  };

  const currentStep = stepIdx >= 0 ? scenario.steps[stepIdx] : null;
  const inCompensation = currentStep?.phase === "compensate";
  const throwFired = stepIdx >= scenario.steps.findIndex(s => s.type === "throw");

  // Split steps into forward + compensation
  const forwardSteps = scenario.steps.filter(s => s.phase === "forward");
  const compSteps = scenario.steps.filter(s => s.phase === "compensate" && s.type !== "throw" && s.type !== "end");
  const throwStep = scenario.steps.find(s => s.type === "throw");
  const endStep = scenario.steps.find(s => s.type === "end");

  const Arrow = ({ active, red, orange }) => (
    <div style={{
      display: "flex", alignItems: "center",
      color: red ? "#ff4c4c" : orange ? "#ff9944" : active ? scenario.color : "#1e3a5a",
      fontSize: 18, transition: "color 0.4s", flexShrink: 0,
    }}>→</div>
  );

  const CompArrow = ({ active }) => (
    <div style={{
      display: "flex", alignItems: "center",
      color: active ? "#ff9944" : "#2a1a08",
      fontSize: 18, transition: "color 0.4s", flexShrink: 0,
    }}>←</div>
  );

  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "linear-gradient(135deg, #06080f 0%, #090c18 60%, #07090f 100%)",
      minHeight: "100vh",
      color: "#c8dff0",
      padding: "28px 20px",
      boxSizing: "border-box",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#4a6ab5", textTransform: "uppercase", marginBottom: 6 }}>BPMN Concept</div>
        <h1 style={{ margin: 0, fontSize: 26, color: "#e8f4ff", letterSpacing: 1 }}>Compensation Activity</h1>
        <p style={{ margin: "8px auto 0", color: "#5a7ab8", fontSize: 13, maxWidth: 480 }}>
          Watch how completed steps get reversed when something fails downstream
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

      {/* Process Diagram */}
      <div style={{ background: "#070c18", border: "1px solid #1a2a4a", borderRadius: 14, padding: "20px 16px", marginBottom: 16 }}>

        {/* Forward Flow */}
        <div style={{ fontSize: 10, color: "#3a5a8a", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
          ▶ Forward Flow
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {forwardSteps.map((step, i) => {
            const state = getState(step);
            const isCurrentStep = stepIdx >= 0 && scenario.steps[stepIdx]?.id === step.id;
            const forwardIdx = scenario.steps.findIndex(s => s.id === step.id);
            const nextForwardIdx = i < forwardSteps.length - 1 ? scenario.steps.findIndex(s => s.id === forwardSteps[i + 1].id) : -1;
            const arrowActive = stepIdx >= nextForwardIdx && nextForwardIdx > 0;
            return (
              <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <StepNode step={step} state={state} scenarioColor={scenario.color} />
                  {isCurrentStep && state !== "failed" && (
                    <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)" }}>
                      <Token color={scenario.color} />
                    </div>
                  )}
                  {state === "failed" && (
                    <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", fontSize: 14 }}>💥</div>
                  )}
                </div>
                {i < forwardSteps.length - 1 && (
                  <Arrow active={arrowActive} red={step.fails && stepIdx > forwardIdx} orange={false} />
                )}
              </div>
            );
          })}

          {/* Throw event off the failure */}
          {throwStep && (
            <>
              <Arrow red={throwFired} active={false} orange={false} />
              <div style={{ position: "relative" }}>
                <StepNode step={throwStep} state={getState(throwStep)} scenarioColor={scenario.color} />
                {scenario.steps[stepIdx]?.id === "throw" && (
                  <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)" }}>
                    <Token color="#ff4c4c" />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        {throwFired && (
          <div style={{
            borderTop: "1px dashed #3a1a08",
            marginBottom: 16,
            position: "relative",
          }}>
            <span style={{
              position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
              background: "#070c18", padding: "0 10px",
              fontSize: 9, color: "#7a3a1a", letterSpacing: 2, textTransform: "uppercase",
            }}>↩ Compensation Phase</span>
          </div>
        )}

        {/* Compensation Flow (reversed) */}
        {throwFired && (
          <>
            <div style={{ fontSize: 10, color: "#7a4a2a", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>
              ↩ Compensation (Undo in Reverse)
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {compSteps.map((step, i) => {
                const state = getState(step);
                const isCurrentStep = scenario.steps[stepIdx]?.id === step.id;
                const compIdx = scenario.steps.findIndex(s => s.id === step.id);
                const nextCompIdx = i < compSteps.length - 1 ? scenario.steps.findIndex(s => s.id === compSteps[i + 1].id) : -1;
                const arrowActive = nextCompIdx > 0 && stepIdx >= nextCompIdx;
                return (
                  <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ position: "relative" }}>
                      <StepNode step={step} state={state} scenarioColor={scenario.color} />
                      {isCurrentStep && (
                        <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)" }}>
                          <Token color="#ff9944" />
                        </div>
                      )}
                    </div>
                    {i < compSteps.length - 1 && <CompArrow active={arrowActive} />}
                  </div>
                );
              })}
              {endStep && (
                <>
                  <Arrow orange={done} active={false} red={false} />
                  <div style={{ position: "relative" }}>
                    <StepNode step={endStep} state={done ? "done" : "idle"} scenarioColor={scenario.color} />
                    {done && scenario.steps[stepIdx]?.id === "end" && (
                      <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)" }}>
                        <Token color="#ff9944" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Step Info */}
      <div style={{
        background: "#090e1c",
        border: `1px solid ${inCompensation ? "#3a1a08" : "#1a2a4a"}`,
        borderLeft: `4px solid ${inCompensation ? "#ff9944" : scenario.color}`,
        borderRadius: 12, padding: "16px 18px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#4a6ab5", letterSpacing: 2, textTransform: "uppercase" }}>
            Step {Math.max(stepIdx + 1, 0)} of {scenario.steps.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            {scenario.steps.map((_, i) => (
              <div key={i} onClick={() => { setAuto(false); setStepIdx(i); if (i === scenario.steps.length - 1) setDone(true); }} style={{
                width: i === stepIdx ? 16 : 7, height: 7, borderRadius: 4,
                background: i === stepIdx ? (inCompensation ? "#ff9944" : scenario.color) : i < stepIdx ? "#2a5a8a" : "#1a2a40",
                cursor: "pointer", transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 17, color: "#e8f4ff" }}>
          {currentStep ? currentStep.label.replace("\n", " ") : "Process Ready"}
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, color: "#7aacd0", lineHeight: 1.6 }}>
          {currentStep ? currentStep.description : `Click Next or Auto Play to walk through the ${scenario.name} scenario.`}
        </p>
        {currentStep?.phase === "compensate" && currentStep.type !== "throw" && currentStep.type !== "end" && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#ff9944", background: "#1a0d00", borderRadius: 6, padding: "6px 10px", display: "inline-block" }}>
            ↩ Undoing: {scenario.steps.find(s => s.id === currentStep.undoes)?.label}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 28 }}>
        {[
          { label: "← Prev", onClick: () => { setAuto(false); setDone(false); setStepIdx(s => Math.max(-1, s - 1)); }, disabled: stepIdx < 0 },
          { label: "↺ Reset", onClick: reset },
          { label: auto ? "▶ Playing…" : "▶ Auto Play", onClick: () => { reset(); setTimeout(() => setAuto(true), 80); }, gold: auto },
          { label: "Next →", onClick: () => { setAuto(false); const next = stepIdx + 1; if (next >= scenario.steps.length) setDone(true); else setStepIdx(next); }, disabled: done },
        ].map((b) => (
          <button key={b.label} onClick={b.onClick} disabled={b.disabled} style={{
            background: b.disabled ? "#090e1c" : b.gold ? "#1a0d00" : "#0d1f3a",
            border: `1px solid ${b.gold ? "#ff9944" : "#1e3a6a"}`,
            borderRadius: 8, color: b.disabled ? "#1e3060" : b.gold ? "#ff9944" : "#c8dff0",
            padding: "10px 20px", fontSize: 13, cursor: b.disabled ? "not-allowed" : "pointer",
          }}>{b.label}</button>
        ))}
      </div>

      {/* Key Rules */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#4a6ab5", textTransform: "uppercase", marginBottom: 10 }}>Key Rules</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
          {[
            { icon: "⚠️", rule: "Only completed tasks can be compensated — active tasks must be cancelled" },
            { icon: "🔄", rule: "Compensation runs in reverse — last completed task is undone first" },
            { icon: "⚡", rule: "A Throw Event triggers compensation; a Catch Event receives it" },
            { icon: "🔗", rule: "Each task that can be undone must have its own compensation handler" },
            { icon: "↩️", rule: "Compensation handlers are linked via dashed association arrows" },
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
