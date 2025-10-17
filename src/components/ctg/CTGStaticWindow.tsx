import React from "react";
import { Modal } from "antd";
import CTGStrip from "./CTGStrip";
import { CTGEvent, CTGQualitySegment, CTGSample } from "./types";

interface CTGStaticWindowProps {
  open: boolean;
  samples: CTGSample[];
  events: CTGEvent[];
  qualitySegments: CTGQualitySegment[];
  baseline: number | null;
  normZone: { from: number; to: number } | null;
  start: number;
  end: number;
  paperSpeed: 1 | 3;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
}

const CTGStaticWindow: React.FC<CTGStaticWindowProps> = ({
  open,
  samples,
  events,
  qualitySegments,
  baseline,
  normZone,
  start,
  end,
  paperSpeed,
  onClose,
  onNavigate,
}) => {
  const visibleSamples = samples.filter((sample) => sample.time >= start && sample.time <= end);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1200}
      footer={null}
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Статический участок КТГ</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onNavigate("prev")}
              style={navButtonStyle}
            >
              Предыдущее
            </button>
            <button
              onClick={() => onNavigate("next")}
              style={navButtonStyle}
            >
              Следующее
            </button>
            <button
              onClick={onClose}
              style={navButtonStyle}
            >
              Назад в live
            </button>
          </div>
        </div>
      }
      styles={{ body: { padding: 16 } }}
    >
      <CTGStrip
        samples={visibleSamples}
        visibleStart={start}
        visibleEnd={end}
        events={events}
        qualitySegments={qualitySegments}
        baseline={baseline}
        normZone={normZone}
        paperSpeed={paperSpeed}
        trackHeight={280}
        onSelectEvent={() => undefined}
        onPan={() => undefined}
        onToggleLive={() => undefined}
      />
    </Modal>
  );
};

const navButtonStyle: React.CSSProperties = {
  border: "1px solid #cbd5f5",
  padding: "4px 8px",
  borderRadius: 4,
  background: "#f8fafc",
  cursor: "pointer",
  fontSize: 12,
};

export default CTGStaticWindow;
