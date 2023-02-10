import mongoose, { Model, Document } from 'mongoose';
import { QueryResult } from '../paginate/paginate';
import { AccessAndRefreshTokens } from '../token/token.interfaces';

export interface IvalidateResponse {
  success: boolean;
}

export interface IUser {
  username: string;
  email: string;
  password: string;
  location?: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  firstname: String; // firstName
  lastname: String; // lastName
  bio: String; // A new bio
  dob: String; // 23rd july 2018
  profile_pic: String | null;
  lastLogin: String | null;
  followers: any;
  following: any;
  requests: any;
}

export interface IUserDoc extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDoc> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  isUsernameTaken(username: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}

export type UpdateUserBody = Partial<IUser>;

export type NewRegisteredUser = Omit<
  IUser,
  'role' | 'lastLogin' | 'isEmailVerified' | 'dob' | 'phone' | 'bio' | 'profile_pic' | 'following' | 'followers' | 'requests'
>;

export type NewCreatedUser = Omit<IUser, 'isEmailVerified' | 'followers' | 'following' | 'requests'>;

export interface IUserWithTokens {
  user: IUserDoc;
  tokens: AccessAndRefreshTokens;
}
