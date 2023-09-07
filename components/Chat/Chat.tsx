import React, { useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import {
    useBroadcastEvent,
    useMutation,
    useOthers,
    useStorage,
    useUpdateMyPresence,
} from "../../liveblocks.config";
import { LiveObject } from "@liveblocks/client";

import { BsFillChatFill } from 'react-icons/bs';
import { FaChevronDown } from 'react-icons/fa';

// Define a type for the User information
type UserInfo = {
    name: string;
    // Add other properties as needed
};

interface Props {
    currentUser: UserInfo | null;
}


function WhoIsHere() {
    const userCount = useOthers((others) => others.length);

    return (
        <p className="font-bold">There are {userCount} other users online</p>
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

    const msgList = useRef<HTMLDivElement>(null);

    const [newMsg, setNewMsg] = useState(false);
    const [opened, setOpened] = useState(false);

    const [draft, setDraft] = useState("");
    const updateMyPresence = useUpdateMyPresence();
    const messages = useStorage((root) => root.messages);

    const sendMessage = useMutation(({ storage }, text, timestamp) => {
        storage.get("messages").push(new LiveObject({ text, timestamp }));
    }, []);

    const deleteMessage = useMutation(({ storage }, index) => {
        storage.get("messages").delete(index);
    }, []);

    useEffect(() => {
        const handleNewMsg = (userId: string, msg: string) => {
            msgList.current?.scroll({ top: msgList.current?.scrollHeight });
            if (!opened) setNewMsg(true);
        };
    }, [opened, messages]);

    return (
        <motion.div
            className=" absolute bottom-0 z-50 flex h-[300px] w-full flex-col justify-between overflow-hidden rounded-t-md sm:left-36 sm:w-[30rem]"
            animate={{ y: opened ? 0 : 260 }}
            transition={{ duration: 0.2 }}
        >
            <button
                className="flex w-full cursor-pointer items-center justify-between bg-zinc-900 py-2 px-10 font-semibold text-white"
                onClick={() => {
                    setOpened((prev) => !prev);
                }}
            >

                <div className="flex items-center gap-2">
                    <BsFillChatFill className="mt-[-2px]" />
                    Chat
                    {newMsg && (
                        <p className="rounded-md bg-green-500 px-1 font-semibold text-green-900">
                            New!
                        </p>
                    )}
                </div>

                <motion.div
                    animate={{ rotate: opened ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                >
                    <FaChevronDown />
                </motion.div>

            </button>
            {/* <WhoIsHere /> */}
            <div className="flex flex-1 flex-col justify-between bg-indigo-100 p-3">
                <div className="h-[190px] overflow-y-scroll pr-2" ref={msgList}>
                    <SomeoneIsTyping />
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            msg={message.text}
                            color=""
                            userId=""
                            deleteMessage={() => deleteMessage(index)}
                            id={index} username={"Tali"}                         />
                    ))}
                </div>
                <ChatInput
                    draft={draft}
                    setDraft={setDraft}
                    updateMyPresence={updateMyPresence}
                    sendMessage={sendMessage}
                />
            </div>



        </motion.div>
    );
}
