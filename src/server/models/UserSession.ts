import { ObjectId } from 'mongodb';

export interface UserSession {
  _id?: ObjectId;
  sessionId: string; // UUID for anonymous users
  createdAt: Date;
  lastAccessedAt: Date;
  userAgent?: string;
  ipAddress?: string;
}
