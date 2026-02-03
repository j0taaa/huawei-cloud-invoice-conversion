"use client";

import { useEffect, useState } from "react";

type Option = {
  flavor: string;
  vCPUs: number;
  memory: number;
  family: string;
};

type EcsOption = {
  name: string;
  vcpus: number;
  memory: number;
  options: Option[];
};

export default function EcsSelector() {
  const [status, setStatus] = useState<string>("");
  const [items, setItems] = useState<EcsOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch("/api/ecs-options");
        if (!response.ok) {
          throw new Error("Failed");
        }
        const data = (await response.json()) as { options: EcsOption[] };
        setItems(data.options ?? []);
      } catch {
        setStatus("Unable to load ECS options. Run data processing first.");
      } finally {
        setLoading(false);
      }
    }
    void loadOptions();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving ECS equivalents...");

    const formData = new FormData(event.currentTarget);
    const selections: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("flavor_")) {
        const name = key.replace("flavor_", "");
        selections[name] = String(value);
      }
    }

    try {
      const response = await fetch("/api/ecs-selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections })
      });
      if (!response.ok) {
        throw new Error("Failed");
      }
      setStatus("ECS equivalents saved. Review the table to export.");
    } catch {
      setStatus("Failed to save ECS equivalents. Please try again.");
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      {loading ? <p className="instructions">Loading ECS options...</p> : null}
      {items.map((flavor) => (
        <div key={flavor.name} className="card card--muted">
          <p>
            <strong>{flavor.name}</strong> — {flavor.vcpus} vCPUs / {flavor.memory} GiB
          </p>
          <select className="select" name={`flavor_${flavor.name}`}>
            {flavor.options.map((option) => (
              <option key={option.flavor} value={option.flavor}>
                {option.flavor} — {option.vCPUs} vCPUs / {option.memory} GiB ({option.family})
              </option>
            ))}
          </select>
        </div>
      ))}
      <button className="button button--primary" type="submit" disabled={!items.length}>
        Submit
      </button>
      {status ? <p className="instructions">{status}</p> : null}
    </form>
  );
}
