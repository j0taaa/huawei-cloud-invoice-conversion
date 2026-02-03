"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FileUploadForm() {
  const [fileName, setFileName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!fileName) {
      setMessage("Choose a PDF file before uploading.");
      return;
    }

    setIsUploading(true);
    setMessage("Uploading PDF...");
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      setMessage("Upload successful. Redirecting...");
      router.push("/success");
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Upload failed.";
      setMessage(fallback);
    } finally {
      setIsUploading(false);
    }
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
      <button className="button button--primary" type="submit" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {fileName ? <span className="badge">Selected: {fileName}</span> : null}
      {message ? <p className="instructions">{message}</p> : null}
    </form>
  );
}
