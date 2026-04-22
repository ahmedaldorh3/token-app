import { useState } from "react";
import TokenGeneration from "./components/TokenGeneration.tsx";
import CallActivity from "./components/CallActivity.tsx";
import CompensationActivity from "./components/CompensationActivity.tsx";
import EventBasedGateway from "./components/EventBasedGateway.tsx";

export default function App() {
  const [selected, setSelected] = useState<string>("token");

  const btn = (active: boolean): React.CSSProperties => ({
    background: active ? "#1a3a5a" : "#0d1f33",
    border: `1px solid ${active ? "#60c8ff" : "#2a5a8a"}`,
    color: active ? "#e8f4ff" : "#7aacd0",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          padding: "20px",
          background: "#06101a",
          borderBottom: "1px solid #1a3a5a",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setSelected("token")} style={btn(selected === "token")}>
          Token Generation
        </button>

        <button onClick={() => setSelected("call")} style={btn(selected === "call")}>
          Call Activity
        </button>

        <button onClick={() => setSelected("comp")} style={btn(selected === "comp")}>
          Compensation Activity
        </button>

        <button onClick={() => setSelected("event")} style={btn(selected === "event")}>
          Event Based Gateway
        </button>
      </div>

      {selected === "token" && <TokenGeneration />}
      {selected === "call" && <CallActivity />}
      {selected === "comp" && <CompensationActivity />}
      {selected === "event" && <EventBasedGateway />}
    </div>
  );
}