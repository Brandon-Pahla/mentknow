import React, { FormEvent, useState } from "react";
import { AiOutlineSend } from 'react-icons/ai';

interface ChatInputProps {
  draft: string;
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  updateMyPresence: (presence: { isTyping: boolean }) => void;
  sendMessage: (text: string, timestamp: number) => void;
}

export function ChatInput({
  draft,
  setDraft,
  updateMyPresence,
  sendMessage,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (draft && e.key === "Enter") {
      updateMyPresence({ isTyping: false });
      sendMessage(draft, Date.now());
      setDraft("");
    }
  };

  return (
    <div className="flex w-full items-center gap-2">
      <input
        className="w-full rounded-xl border border-zinc-900 p-5 py-1"
        type="text"
        placeholder="type your message..."
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          updateMyPresence({ isTyping: true });
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => updateMyPresence({ isTyping: false })}
      />
      
    </div>
  );
}
