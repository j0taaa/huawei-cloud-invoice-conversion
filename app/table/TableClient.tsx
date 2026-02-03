"use client";

import { useEffect, useMemo, useState } from "react";
import { regions } from "@/lib/regions";

type DataItem = {
  type: string;
  kind: string;
  usage?: number;
  requests?: number;
  list?: string[];
};

export default function TableClient() {
  const [region, setRegion] = useState(regions[0]);
  const [status, setStatus] = useState<string>("");
  const [items, setItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTable() {
      try {
        const response = await fetch("/api/table-data");
        if (!response.ok) {
          throw new Error("Failed");
        }
        const data = (await response.json()) as { data: DataItem[]; region: string };
        setItems(data.data ?? []);
        if (data.region) {
          setRegion(data.region);
        }
      } catch {
        setStatus("Failed to load table data. Upload and process an invoice first.");
      } finally {
        setLoading(false);
      }
    }
    void loadTable();
  }, []);

  const unavailableItems = useMemo(() => {
    const match = items.find((item) => item.type === "N/A");
    return match?.list ?? [];
  }, [items]);

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
          {items
            .filter((item) => item.type !== "N/A")
            .map((item) => (
              <tr key={`${item.type}-${item.kind}`}>
                <td>{item.type}</td>
                <td>{item.kind}</td>
                <td>{item.usage ?? "N/A"}</td>
                <td>{item.requests ?? "N/A"}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {loading ? <p className="instructions">Loading converted data...</p> : null}

      {unavailableItems.length ? (
        <div>
          <p className="not-available">Items not available on Huawei Cloud:</p>
          <p className="instructions">{unavailableItems.join(", ")}</p>
        </div>
      ) : null}

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
