import { Model } from 'mongoose';
import { QueryResult } from '../paginate/paginate';

export interface IPost {
  createdAt: Date;
  user: any;
  caption: string;
  hashtag: string[] | undefined;
  likes: any[];
  post_type: string;
  post_files: any[];
  comments: any;
}

export interface IPostModel extends Model<IPost> {
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}
