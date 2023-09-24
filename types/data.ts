/**
 * These types are used in `/data`
 */

export type User = {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  groupIds: string[];
};

export type Group = {
  id: string;
  name: string;
};


export interface MessageType {
  timestamp: number;
  userId: string;
  sender: string;
  color: string;
  msg: string;
  id: number;
  deleteMessage: () => void;
}


export interface ResourceType  {
  owner: string;
  timestamp: number;
  link: string;
  description: string;
  id: number;
  deleteResource: () => void;
};