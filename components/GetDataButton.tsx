"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "done" | "error";

export default function GetDataButton() {
  const [status, setStatus] = useState<Status>("idle");

  const labelMap: Record<Status, string> = {
    idle: "Process data",
    loading: "Processing...",
    done: "Done",
    error: "Try again"
  };

  async function handleClick() {
    setStatus("loading");
    try {
      const response = await fetch("/get-data");
      if (!response.ok) {
        throw new Error("Failed");
      }
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="form-stack">
      <button
        type="button"
        className="button button--primary"
        onClick={handleClick}
        disabled={status === "loading"}
      >
        {labelMap[status]}
      </button>
      <span className="inline-status">
        {status === "loading" && "Loading..."}
        {status === "done" && "Data processed successfully."}
        {status === "error" && "Something went wrong."}
      </span>
    </div>
  );
}
