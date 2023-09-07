import React from "react";
import { MessageType } from "../../types";

// interface ChatMessageProps {
//   message: {
//     text: string;
//   };
//   deleteMessage: () => void;
// }

export function ChatMessage({ msg,username,deleteMessage }: MessageType) {
  return (
    <div 
      className={`my-2 flex gap-2 text-clip ${username && 'justify-end text-right'}`}
    >
      {/* <span className="text-1xl font-bold">{msg}</span>
      <button className="delete_button" onClick={deleteMessage}>
        ✕
      </button> */}

      { (
        <h5 style={{ color:'red' }} className="font-bold">
          {username}
        </h5>
      )}
      <p style={{ wordBreak: 'break-all' }}>{msg}</p><button className="delete_button" onClick={deleteMessage}>
        ✕
      </button>
    </div>
  );
}
