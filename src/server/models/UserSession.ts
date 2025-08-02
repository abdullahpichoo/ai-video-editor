import { ObjectId } from 'mongodb';

export interface UserSession {
  _id?: ObjectId;
  userId: string; // References User._id
  sessionToken: string; // Auth.js session token
  expires: Date;
  createdAt: Date;
  lastAccessedAt: Date;
  userAgent?: string;
  ipAddress?: string;
}
