"use client";

import { useEffect, useState } from "react";
import { regions } from "@/lib/regions";

export default function RegionSelector() {
  const [region, setRegion] = useState<string>(regions[0]);
  const [status, setStatus] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadRegion() {
    try {
      const response = await fetch("/api/instance");
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as { region?: string };
      if (data.region) {
        setRegion(data.region);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    void loadRegion();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setStatus("Saving region...");
    try {
      const response = await fetch("/api/region", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region })
      });
      if (!response.ok) {
        throw new Error("Failed");
      }
      setStatus("Region saved successfully.");
    } catch {
      setStatus("Failed to save region. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

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
      <button
        type="button"
        className="button button--secondary"
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Region"}
      </button>
      {status ? <p className="instructions">{status}</p> : null}
    </div>
  );
}
