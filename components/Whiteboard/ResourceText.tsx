import React from "react";
import { ResourceType } from "../../types";


export function ResourceText({ owner, timestamp, link, description, deleteResource }: ResourceType) {
    return (
        <div className="">
            <div
                className={`bg-slate-300 w-full px-4 py-4 rounded-lg flex justify-between  gap-2 text-clip ${owner && 'justify-end text-right'} `}
            >
                <a href={link} target="_blank" className="whitespace-normal" >
                    <p className="whitespace-normal" >{description}</p>
                </a>
                <button className="delete_button text-[#dc2626]" onClick={deleteResource}>
                    ✕
                </button>
            </div>
            <div className="flex gap-3">
                <p className="text-xs text-gray-600 mb-2 " >{
                    new Date(timestamp).toLocaleString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                    })
                }</p>
                <div className=" text-left flex flex-col justify-start">
                    <i className="text-gray text-xs">{owner}</i>
                </div>
            </div>
        </div>
    );
}
