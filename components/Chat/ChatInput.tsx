import React, { FormEvent, useState } from "react";
import { AiOutlineSend } from 'react-icons/ai';
import { useSelf } from "../../liveblocks.config";
import './Chatinput.module.css'

interface ChatInputProps {
  draft: string;
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  updateMyPresence: (presence: { isTyping: boolean }) => void;
  sendMessage: (text: string, timestamp: number, sender: string, color: string) => void;
}

export function ChatInput({
  draft,
  setDraft,
  updateMyPresence,
  sendMessage,
}: ChatInputProps) {

  const self = useSelf();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (draft && e.key === "Enter") {
      updateMyPresence({ isTyping: false });
      sendMessage(draft, Date.now(), self.info.name, self.info.color);
      // console.log('Username is:', self.info.name)
      setDraft("");
    }
  };

  return (
    <div className="flex w-full items-center gap-2">
      <input
        className=" messageInput w-full rounded-xl border border-zinc-900 p-5 py-1 focus:outline-none focus-ring focus:border-blue-500"
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
