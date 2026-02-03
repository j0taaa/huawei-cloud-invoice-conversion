"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SelectionMode = "begin" | "end" | "none";

type Position = {
  page: number;
  y: number;
};

type InstanceInfo = {
  pdfUrl: string | null;
  startPage: number;
  startY: number;
  endPage: number;
  endY: number;
};

declare global {
  interface Window {
    pdfjsLib?: {
      getDocument: (src: string) => { promise: Promise<any> };
    };
  }
}

export default function PositionSelector() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mode, setMode] = useState<SelectionMode>("begin");
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState<Position>({ page: 1, y: 0 });
  const [end, setEnd] = useState<Position>({ page: 1, y: 0 });
  const [status, setStatus] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [pdfReady, setPdfReady] = useState(false);

  const modeLabel = useMemo(() => {
    if (mode === "begin") {
      return "Selecting beginning position";
    }
    if (mode === "end") {
      return "Selecting end position";
    }
    return "Selection paused";
  }, [mode]);

  useEffect(() => {
    async function loadInstance() {
      try {
        const response = await fetch("/api/instance");
        if (!response.ok) {
          throw new Error("Failed");
        }
        const data = (await response.json()) as InstanceInfo;
        setPdfUrl(data.pdfUrl);
        if (data.startPage >= 0) {
          setStart({ page: data.startPage + 1, y: data.startY });
        }
        if (data.endPage >= 0) {
          setEnd({ page: data.endPage + 1, y: data.endY });
        }
      } catch {
        setStatus("Upload a PDF first to select positions.");
      }
    }
    void loadInstance();
  }, []);

  useEffect(() => {
    if (!pdfUrl) {
      setIsLoadingPdf(false);
      return;
    }
    if (window.pdfjsLib) {
      setPdfReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js";
    script.onload = () => {
      setStatus("");
      setPdfReady(true);
    };
    script.onerror = () => {
      setStatus("Failed to load PDF preview.");
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [pdfUrl]);

  useEffect(() => {
    async function loadPdf() {
      if (!pdfUrl || !window.pdfjsLib || !pdfReady) {
        return;
      }
      setIsLoadingPdf(true);
      try {
        const loaded = await window.pdfjsLib.getDocument(pdfUrl).promise;
        setPdfDoc(loaded);
        setTotalPages(loaded.numPages || 1);
      } catch {
        setStatus("Unable to load the PDF. Please re-upload.");
      } finally {
        setIsLoadingPdf(false);
      }
    }
    void loadPdf();
  }, [pdfReady, pdfUrl]);

  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current) {
        return;
      }
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
    },
    [pdfDoc]
  );

  useEffect(() => {
    void renderPage(currentPage);
  }, [currentPage, renderPage]);

  function handleCanvasClick() {
    if (mode === "begin") {
      setMode("end");
    } else if (mode === "end") {
      setMode("none");
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const pdfX = Math.round(x * scaleX);
    const pdfY = Math.round(y * scaleY);

    setCursor({ x: pdfX, y: pdfY });

    if (mode === "begin") {
      setStart({ page: currentPage, y: pdfY });
    }

    if (mode === "end") {
      setEnd({ page: currentPage, y: pdfY });
    }
  }

  async function handleSave() {
    setStatus("Saving positions...");
    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startPage: start.page - 1,
          startY: start.y,
          endPage: end.page - 1,
          endY: end.y
        })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      setStatus("Positions saved. You can process data now.");
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Failed to save positions.";
      setStatus(fallback);
    }
  }

  return (
    <div className="grid-two">
      <div className="card">
        <h2 className="section-title">Select start and end positions</h2>
        <form className="form-stack">
          <input className="input" type="number" value={start.page} readOnly />
          <input className="input" type="number" value={start.y} readOnly />
          <input className="input" type="number" value={end.page} readOnly />
          <input className="input" type="number" value={end.y} readOnly />
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
          <button type="button" className="button button--primary" onClick={handleSave}>
            Save Positions
          </button>
        </div>
        <p className="instructions" style={{ marginTop: "12px" }}>
          {modeLabel}. Click on the PDF preview to lock the position. The start position should
          be where the billing per service section begins.
        </p>
        {status ? <p className="instructions">{status}</p> : null}
      </div>

      <div className="pdf-viewer">
        <div className="flex-row" style={{ justifyContent: "space-between" }}>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </button>
          <span className="badge">Page {currentPage}</span>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </button>
        </div>
        <div className="pdf-canvas">
          {isLoadingPdf ? <p className="instructions">Loading PDF...</p> : null}
          <canvas ref={canvasRef} onMouseMove={handleMouseMove} onClick={handleCanvasClick} />
          <span
            className="pdf-marker"
            style={{
              top: `${(start.y / (canvasRef.current?.height || 1)) * 100}%`,
              left: "20%",
              opacity: 1
            }}
          />
          <span
            className="pdf-marker"
            style={{
              top: `${(end.y / (canvasRef.current?.height || 1)) * 100}%`,
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
