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
  userId: string;
  username: string;
  color: string;
  msg: string;
  id: number;
  deleteMessage: () => void;
}