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
      <div className="upload-list">
        {entries.map((entry, index) => (
          <div key={entry.id} className="upload-row">
            <div className="upload-field">
              <label className="field-label" htmlFor={`entry-name-${entry.id}`}>
                File label
              </label>
              <input
                id={`entry-name-${entry.id}`}
                className="input"
                type="text"
                placeholder="e.g. November invoice"
                value={entry.name}
                onChange={(event) => handleChange(entry.id, { name: event.target.value })}
                required
              />
            </div>
            <div className="upload-field">
              <label className="field-label" htmlFor={`entry-file-${entry.id}`}>
                XLSX file
              </label>
              <input
                id={`entry-file-${entry.id}`}
                className="input input--file"
                type="file"
                accept=".xlsx"
                onChange={(event) => handleChange(entry.id, { file: event.target.files?.[0] })}
                required
              />
            </div>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => handleRemove(entry.id)}
              disabled={entries.length === 1}
              aria-label={`Remove file ${index + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="upload-actions">
        <button type="button" className="button button--secondary" onClick={handleAdd}>
          + Add file
        </button>
        <button type="submit" className="button button--primary">
          Generate Excel
        </button>
      </div>
      {status ? <p className="status-banner">{status}</p> : null}
    </form>
  );
}
