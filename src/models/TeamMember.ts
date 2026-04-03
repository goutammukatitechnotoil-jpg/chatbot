import { ObjectId } from 'mongodb';

export interface TeamMember {
  _id?: ObjectId;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  created_by: string;
  created_at?: Date;
}
