import React from "react";
import { MessageType } from "../../types";


export function ChatMessage({ msg,sender, timestamp, color,deleteMessage }: MessageType) {
  return (
    <div 
      className={`bg-[#c9d3ff] w-fit px-4 py-4 rounded-lg my-2 flex gap-2 text-clip ${sender && 'justify-end text-right'} `}
    >
      { (
        <div className=" text-left flex flex-col justify-start">
          <i className=" font-bold text-xs" style={{ color: color }}>{sender}</i>
          <p className="text-xs text-indigo-600 " >{new Date(timestamp).toLocaleTimeString()}</p>
        </div>
      )}
      
      <p className="whitespace-normal" >{msg}</p>
      {/* <button className="delete_button" onClick={deleteMessage}>
        ✕
      </button> */}
    </div>
  );
}
