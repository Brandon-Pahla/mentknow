import React from "react";
import { ResourceType } from "../../types";


export function ResourceText({ owner, timestamp, link, description, deleteResource }: ResourceType) {
    return (
        <div
            className={`bg-[#c9d3ff] w-fit px-4 py-4 rounded-lg my-2 flex gap-2 text-clip ${owner && 'justify-end text-right'} `}
        >
            {(
                <div className=" text-left flex flex-col justify-start">
                    <i className=" font-bold text-xs">{owner}</i>
                    <p className="text-xs text-indigo-600 " >{new Date(timestamp).toLocaleTimeString()}</p>
                </div>
            )}

            <div>
                <a href={link} className="whitespace-normal" >
                    <p className="whitespace-normal" >{description}</p>
                </a>
            </div>
            <button className="delete_button" onClick={deleteResource}>
                ✕
            </button>
        </div>
    );
}
