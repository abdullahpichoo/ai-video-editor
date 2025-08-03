import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  name?: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
