import React, { useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { 
    useBroadcastEvent,
    useStorage,
    useUpdateMyPresence,
    RoomProvider,
    useOthers,
    useMutation,
  } from '../../liveblocks.config';
  import "@liveblocks/react";
import { LiveList, LiveObject } from "@liveblocks/client";
import { useRouter } from "next/router";
import { ClientSideSuspense } from "@liveblocks/react";

// Define a type for the User information
type UserInfo = {
  name: string;
  // Add other properties as needed
};

// Define a type for the Chat message
type Message = {
  text: string;
  sender: string | null;
  timestamp: number;
};

interface Props {
  currentUser: UserInfo | null;
}

function WhoIsHere() {
    const userCount = useOthers((others) => others.length);
  
    return (
      <div className="who_is_here">There are {userCount} other users online</div>
    );
  }
  
  function SomeoneIsTyping() {
    const someoneIsTyping = useOthers((others) =>
      others.some((other) => other.presence.isTyping)
    );
  
    return (
      <div className="someone_is_typing">
        {someoneIsTyping ? "Someone is typing..." : ""}
      </div>
    );
  }



export function Chat({ currentUser }: Props) {
//   const [messages, setMessages] = useState<Message[]>([]);
  
  const [draft, setDraft] = useState("");
  const updateMyPresence = useUpdateMyPresence();
  const messages = useStorage((root) => root.messages);

  const sendMessage = useMutation(({ storage }, text) => {
    storage.get("messages").push(new LiveObject({ text }));
  }, []);

  const deleteMessage = useMutation(({ storage }, index) => {
    storage.get("messages").delete(index);
  }, []);


  const handleSendMessage = (text: string) => {
    if (text.trim() !== "") {
      // Create a new message with the current user's name as the sender
      const newMessage: Message = {
        text,
        sender: currentUser ? currentUser.name : null,
        timestamp: Date.now(),
      };

    //   setMessages([...messages, newMessage]);
      

    }
  };

  return (
    <div className="container">
      
      <WhoIsHere />
      <input
        type="text"
        placeholder="type your message?"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          updateMyPresence({ isTyping: true });
        }}
        onKeyDown={(e) => {
          if (draft && e.key === "Enter") {
            updateMyPresence({ isTyping: false });
            sendMessage(draft);
            setDraft("");
          }
        }}
        onBlur={() => updateMyPresence({ isTyping: false })}
      />
      <SomeoneIsTyping />
      {messages.map((message, index) => {
        return (
          <div key={index} className="message_container">
              <span
                style={{
                  cursor: "pointer",
                //   textDecoration: message.checked ? "line-through" : undefined,
                }}
              >
                {message.text}
              </span>
            <button className="delete_button" onClick={() => deleteMessage(index)}>
              ✕
            </button>
          </div>
        );
      })}
      
      {/* <div>
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
      </div>
      <ChatInput onSendMessage={handleSendMessage} /> */}
    </div>
  );
}