import express, { Router } from 'express';
import authRoute from './auth.route';
import commentRoute from './comment.route';
import postRoute from './post.route';
import docsRoute from './swagger.route';
import userRoute from './user.route';
import songRoute from "./song.route";
import playlistRoute from './playlist.route';
import chatRoute from "./chat.route"
import replyRoute from './comment_reply.route';
import config from '../../config/config';
import artistRouter from "./artist.route"

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/artists',
    route: artistRouter,
  },
  {
    path: '/posts',
    route: postRoute,
  },
  {
    path: '/comment',
    route: commentRoute,
  },
  {
    path: '/replies',
    route: replyRoute,
  },
  {
    path: '/songs',
    route: songRoute,
  },
  {
    path: '/playlists',
    route: playlistRoute,
  },
  {
    path: '/chats',
    route: chatRoute,
  },
  
];

const devIRoute: IRoute[] = [
  // IRoute available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultIRoute.forEach((route) => {  
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devIRoute.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
