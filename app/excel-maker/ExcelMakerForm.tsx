"use client";

import { useState } from "react";

type UploadEntry = {
  id: string;
  name: string;
  file?: File;
};

const createEntry = (): UploadEntry => ({
  id: Math.random().toString(36).slice(2),
  name: ""
});

export default function ExcelMakerForm() {
  const [entries, setEntries] = useState<UploadEntry[]>([createEntry()]);
  const [status, setStatus] = useState<string>("");

  function handleAdd() {
    setEntries((current) => [...current, createEntry()]);
  }

  function handleRemove(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  function handleChange(id: string, update: Partial<UploadEntry>) {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, ...update } : entry))
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = entries.some((entry) => !entry.name || !entry.file);
    if (missing) {
      setStatus("Add a name and XLSX file for each entry before generating.");
      return;
    }
    setStatus("Excel bundle queued. Download will start once processing completes.");
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      {entries.map((entry) => (
        <div key={entry.id} className="flex-row">
          <input
            className="input"
            type="text"
            placeholder="Enter file name..."
            value={entry.name}
            onChange={(event) => handleChange(entry.id, { name: event.target.value })}
            required
          />
          <input
            className="input input--file"
            type="file"
            accept=".xlsx"
            onChange={(event) => handleChange(entry.id, { file: event.target.files?.[0] })}
            required
          />
          <button
            type="button"
            className="button button--secondary"
            onClick={() => handleRemove(entry.id)}
            disabled={entries.length === 1}
          >
            Remove
          </button>
        </div>
      ))}
      <div className="flex-row">
        <button type="button" className="button button--success" onClick={handleAdd}>
          + Add File
        </button>
        <button type="submit" className="button button--success">
          Generate Excel
        </button>
      </div>
      {status ? <p className="instructions">{status}</p> : null}
    </form>
  );
}
