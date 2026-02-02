"use client";

import { useState } from "react";

export default function FileUploadForm() {
  const [fileName, setFileName] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fileName) {
      setMessage("Choose a PDF file before uploading.");
      return;
    }
    setMessage("File staged. You can proceed to select positions.");
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <input
        className="input input--file"
        type="file"
        name="file"
        accept="application/pdf"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setFileName(file?.name ?? "");
        }}
      />
      <button className="button button--primary" type="submit">
        Upload
      </button>
      {fileName ? (
        <span className="badge">Selected: {fileName}</span>
      ) : null}
      {message ? <p className="instructions">{message}</p> : null}
    </form>
  );
}
