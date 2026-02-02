"use client";

import { useMemo, useState } from "react";

const totalPages = 5;

type SelectionMode = "begin" | "end" | "none";

type Position = {
  page: number;
  y: number;
};

export default function PositionSelector() {
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState<SelectionMode>("begin");
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState<Position>({ page: 1, y: 0 });
  const [end, setEnd] = useState<Position>({ page: 1, y: 0 });

  const modeLabel = useMemo(() => {
    if (mode === "begin") {
      return "Selecting beginning position";
    }
    if (mode === "end") {
      return "Selecting end position";
    }
    return "Selection paused";
  }, [mode]);

  function handleCanvasClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = Math.round(((event.clientY - rect.top) / rect.height) * 1000);

    if (mode === "begin") {
      setStart({ page: currentPage, y: clickY });
      setMode("end");
    } else if (mode === "end") {
      setEnd({ page: currentPage, y: clickY });
      setMode("none");
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * 1000);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * 1000);
    setCursor({ x, y });

    if (mode === "begin") {
      setStart({ page: currentPage, y });
    }

    if (mode === "end") {
      setEnd({ page: currentPage, y });
    }
  }

  return (
    <div className="grid-two">
      <div className="card">
        <h2 className="section-title">Select start and end positions</h2>
        <form className="form-stack">
          <input
            className="input"
            type="number"
            name="startingPage"
            value={start.page}
            readOnly
          />
          <input
            className="input"
            type="number"
            name="startingY"
            value={start.y}
            readOnly
          />
          <input
            className="input"
            type="number"
            name="endingPage"
            value={end.page}
            readOnly
          />
          <input
            className="input"
            type="number"
            name="endingY"
            value={end.y}
            readOnly
          />
        </form>
        <div className="flex-row" style={{ marginTop: "16px" }}>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setMode(mode === "begin" ? "none" : "begin")}
          >
            Select Beginning
          </button>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => setMode(mode === "end" ? "none" : "end")}
          >
            Select End
          </button>
        </div>
        <p className="instructions" style={{ marginTop: "12px" }}>
          {modeLabel}. Click on the preview to lock the position. The start position should be
          where the billing per service section begins.
        </p>
      </div>

      <div className="pdf-viewer">
        <div className="flex-row" style={{ justifyContent: "space-between" }}>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </button>
          <span className="badge">Page {currentPage}</span>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
          >
            Next
          </button>
        </div>
        <div
          className="pdf-canvas"
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
        >
          <span
            className="pdf-marker"
            style={{
              top: `${(start.y / 1000) * 100}%`,
              left: "20%",
              opacity: 1
            }}
          />
          <span
            className="pdf-marker"
            style={{
              top: `${(end.y / 1000) * 100}%`,
              left: "80%",
              backgroundColor: "#007bff",
              opacity: 1
            }}
          />
        </div>
        <div className="instructions">Cursor position: ({cursor.x}, {cursor.y})</div>
      </div>
    </div>
  );
}
