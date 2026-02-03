"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ManualSpecsForm() {
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      setStatus("Please enter the ECS specs before submitting.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Saving manual specs...");
    try {
      const response = await fetch("/api/manual-specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      setStatus("Specs saved. Redirecting...");
      router.push("/success");
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Failed to save specs.";
      setStatus(fallback);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <textarea
        className="textarea"
        name="message"
        placeholder="Type your ECS specs..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button className="button button--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send"}
      </button>
      {status ? <p className="instructions">{status}</p> : null}
    </form>
  );
}
