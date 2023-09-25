import React, { FormEvent, useState } from "react";
import { AiOutlineSend } from 'react-icons/ai';
import { useSelf } from "../../liveblocks.config";

interface ResourceInputProps {
  draft: string;
  descriptionDraft: string; // Add a description draft state
  setDraft: React.Dispatch<React.SetStateAction<string>>;
  setDescriptionDraft: React.Dispatch<React.SetStateAction<string>>; // Add a setDescriptionDraft function
//   updateMyPresence: (presence: { isTyping: boolean }) => void;
  saveResource: (owner: string, timestamp: number, link: string, description: string) => void; // Update the saveResource function
}

export function ResourceInput({
  draft,
  descriptionDraft, // Add descriptionDraft
  setDraft,
  setDescriptionDraft, // Add setDescriptionDraft
//   updateMyPresence,
  saveResource,
}: ResourceInputProps) {

  const self = useSelf();
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (draft && e.key === "Enter") {
    //   updateMyPresence({ isTyping: false });
      saveResource(self.info.name, Date.now(), draft, descriptionDraft); // Pass descriptionDraft
      setDraft("");
      setDescriptionDraft(""); // Clear descriptionDraft
    }
  };

  return (
    <div className="flex flex-col w-full">
      
      {/* Input field for description */}
      <input
        className="mb-2 rounded-xl border border-zinc-900 p-2 focus:outline-none focus-ring focus:border-blue-500"
        type="text"
        placeholder="Description of the resource..."
        value={descriptionDraft}
        onChange={(e) => setDescriptionDraft(e.target.value)}
        // onBlur={() => updateMyPresence({ isTyping: false })}
      />
      {/* Input field for message */}
      <input
        className="mb-2 rounded-xl border border-zinc-900 p-2 focus:outline-none focus-ring focus:border-blue-500"
        type="text"
        placeholder="Link to the resource..."
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
        //   updateMyPresence({ isTyping: true });
        }}
        onKeyDown={handleKeyDown}
      />

      
    </div>
  );
}
