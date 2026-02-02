"use client";

import { useState } from "react";
import { ecsMappings } from "@/lib/ecsOptions";

export default function EcsSelector() {
  const [status, setStatus] = useState<string>("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("ECS equivalents saved. Review the table to export.");
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      {ecsMappings.map((flavor) => (
        <div key={flavor.name} className="card card--muted">
          <p>
            <strong>{flavor.name}</strong> — {flavor.vCPUs} vCPUs / {flavor.memory} GiB
          </p>
          <select className="select" name={`flavor_${flavor.name}`}>
            {flavor.options.map((option) => (
              <option key={option.flavor} value={option.flavor}>
                {option.flavor} — {option.vCPUs} vCPUs / {option.memory} GiB ({option.category})
              </option>
            ))}
          </select>
        </div>
      ))}
      <button className="button button--primary" type="submit">
        Submit
      </button>
      {status ? <p className="instructions">{status}</p> : null}
    </form>
  );
}
