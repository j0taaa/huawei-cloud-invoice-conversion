"use client";

import { useState } from "react";
import { regions } from "@/lib/regions";

export default function RegionSelector() {
  const [region, setRegion] = useState<string>(regions[0]);
  const [status, setStatus] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    setStatus("Refreshing region data...");

    try {
      const response = await fetch("/refresh-region", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ region })
      });

      if (!response.ok) {
        throw new Error("Failed");
      }

      setStatus("Region refreshed successfully.");
    } catch {
      setStatus("Failed to refresh region. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="form-stack">
      <div>
        <label htmlFor="regionSelect" className="badge">
          Choose your region
        </label>
        <select
          id="regionSelect"
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
      </div>
      <button
        type="button"
        className="button button--primary"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? "Refreshing..." : "Refresh Region"}
      </button>
      {status ? <p className="instructions">{status}</p> : null}
    </div>
  );
}
