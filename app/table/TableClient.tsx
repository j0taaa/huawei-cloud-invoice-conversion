"use client";

import { useState } from "react";
import { regions } from "@/lib/regions";
import { convertedItems, unavailableItems } from "@/lib/sampleData";

export default function TableClient() {
  const [region, setRegion] = useState(regions[0]);
  const [status, setStatus] = useState<string>("");

  async function handleCopy() {
    setStatus("Generating automation script...");
    try {
      const response = await fetch(`/getJS?region=${encodeURIComponent(region)}`);
      if (!response.ok) {
        throw new Error("Failed");
      }
      const data = (await response.json()) as { code: string };

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(data.code);
        setStatus("Code copied to clipboard.");
      } else {
        setStatus("Clipboard access unavailable. Copy manually from console response.");
      }
    } catch {
      setStatus("Failed to generate code. Please try again.");
    }
  }

  return (
    <div className="form-stack">
      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Kind</th>
            <th>Usage</th>
            <th>Requests</th>
          </tr>
        </thead>
        <tbody>
          {convertedItems.map((item) => (
            <tr key={`${item.type}-${item.kind}`}>
              <td>{item.type}</td>
              <td>{item.kind}</td>
              <td>{item.usage}</td>
              <td>{item.requests}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <p className="not-available">Items not available on Huawei Cloud:</p>
        <p className="instructions">{unavailableItems.join(", ")}</p>
      </div>

      <select
        className="select"
        value={region}
        onChange={(event) => setRegion(event.target.value)}
      >
        {regions.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      <button className="button button--primary" type="button" onClick={handleCopy}>
        Copy code to clipboard
      </button>
      {status ? <p className="instructions">{status}</p> : null}
    </div>
  );
}
