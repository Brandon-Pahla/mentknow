import React from "react";

interface ChatMessageProps {
  message: {
    text: string;
    sender: string | null;
    timestamp: number;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { text, sender, timestamp } = message;

  return (
    <div>
      <p>{sender || "Unknown User"}</p>
      <p>{text}</p>
      <p>{new Date(timestamp).toLocaleTimeString()}</p>
    </div>
  );
}
