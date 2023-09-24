import React, { useEffect, useRef, useState } from "react";
import { useMutation, useStorage } from "../../liveblocks.config";
import { LiveObject } from "@liveblocks/client";
import { ResourceInput } from "./ResourceInput";
import { ResourceText } from "./ResourceText";

// Define the FloatingComponentProps
interface FloatingComponentProps {
    // You can add any props you need here
}

const Resources: React.FC<FloatingComponentProps> = () => {
    const [expanded, setExpanded] = useState(false);

    const resources = useStorage((root) => root.resources);
    const [draft, setDraft] = useState("");
    const [description, setDescription] = useState("");
    const [opened, setOpened] = useState(false);

    const saveResource = useMutation(({ storage }, owner, timestamp, link, description) => {
        storage.get("resources").push(new LiveObject({ owner, timestamp, link, description }));
    }, []);

    const deleteResource = useMutation(({ storage }, index) => {
        storage.get("resources").delete(index);
    }, []);

    const msgList = useRef<HTMLDivElement>(null);

    const toggleExpansion = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
        const handleNewMsg = (userId: string, msg: string) => {
            msgList.current?.scroll({ top: msgList.current?.scrollHeight });
            // if (!opened) setNewMsg(true);
        };
    }, [opened, resources]);

    return (
        <div className="fixed bottom-12 right-4 z-50">
            {/* The floating button */}
            <button
                className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-all delay-100"
                onClick={toggleExpansion}
            >
                {expanded ? "-" : "+"}
            </button>

            {/* The expanded content */}
            {expanded && (
                <div className="bg-white rounded-t-lg shadow-lg mt-2 transition-all delay-500 text-sm max-w-prose">
                    <div className="bg-gray-900 text-white p-2 rounded-t-md">
                        <h2 className="text-md font-semibold">Weekly resurces</h2>
                    </div>
                    <div className="p-5">
                        <div className="h-[190px] overflow-y-scroll pr-2" ref={msgList}>
                            {resources.map((resource, index) => (
                                <ResourceText
                                    key={index}
                                    link={resource.link}
                                    description={resource.description}
                                    deleteResource={() => deleteResource(index)}
                                    id={index} owner={resource.owner} timestamp={resource.timestamp} />
                            ))}
                        </div>
                        <ResourceInput
                            draft={draft}
                            descriptionDraft={description}
                            setDraft={setDraft}
                            setDescriptionDraft={setDescription}

                            // updateMyPresence={updateMyPresence}
                            saveResource={saveResource}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resources;
