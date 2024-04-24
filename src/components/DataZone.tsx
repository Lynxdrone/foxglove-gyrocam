import React from "react";

interface DataZoneProps {
  title: string;
  value: string | undefined;
  unit?: string;
  level?: string; // Dictates zone color
}

const getBackgroundColor = (level: string | undefined) => {
  switch (level) {
    case "OK":
      return '#CBE6F5'; // Blue
    case "WARN":
      return '#F4F0C1'; // Yellow
    case "ERROR":
      return '#EEC8C5'; // Red
    case "STALE":
      return '#a8a8a8'; // Grey
    case undefined:
      return "#3a3a3e"; // Basic color (dark grey)
    default:
      return '#fff';
  }
};

const getTextColor = (level: string | undefined) => {
  switch (level) {
    case "OK":
      return '#4580B0'; // Blue
    case "WARN":
      return '#96722E'; // Yellow
    case "ERROR":
      return '#AC2F29'; // Red
    case "STALE":
      return '#6b6b6b'; // Grey
    case undefined:
      return "#ffffff"; // Basic color (white)
    default:
      return '#fff';
  }
};

const DataZone: React.FC<DataZoneProps> = (input) => {
  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(input.level),
        color: getTextColor(input.level),
        padding: "0.3rem",
        borderRadius: "0.5rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "0.1rem" }}>
        {input.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
        <div style={{ alignSelf: "center" }}>
          {input.value}{input.unit}
        </div>
      </div>
    </div>
  );
};

export default DataZone;