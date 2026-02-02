"use client";

import { useState } from "react";

export default function ManualSpecsForm() {
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) {
      setStatus("Please enter the ECS specs before submitting.");
      return;
    }
    setStatus("Specs saved. You can proceed to select ECS equivalents.");
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
      <button className="button button--primary" type="submit">
        Send
      </button>
      {status ? <p className="instructions">{status}</p> : null}
    </form>
  );
}
