// @ts-nocheck
import { errorConverter, errorHandler } from "./modules/errors/error";
import mongoose from "mongoose";
import app from "./app";
import config from "./config/config";
import logger from "./modules/logger/logger";
import { Server } from "socket.io";
import http from "http";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import session from "express-session";
import * as AdminJSMongoose from "@adminjs/mongoose";
import User from "./modules/user/user.model";
import { authLimiter } from "./modules/utils";
import routes from "./routes/v1";
import Song from "./modules/songs/models/song.model";
import Album from "./modules/songs/models/album.model";
import Genre from "./modules/songs/models/genre.model";
import Playlist from "./modules/songs/models/playlist.model";
import Posts from "./modules/posts/post.model";
import express, { Express } from "express";
import helmet from "helmet";
import xss from "xss-clean";
import ExpressMongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cors from "cors";
import passport from "passport";
import httpStatus from "http-status";
import config from "./config/config";
import { morgan } from "./modules/logger";
import { jwtStrategy } from "./modules/auth";
import { ApiError, errorConverter, errorHandler } from "./modules/errors";
import Artist from "./modules/songs/models/artist.model";

AdminJS.registerAdapter(AdminJSMongoose);

let server: any;

const users = [];

const addUser = ({ id, name, room }) => {
  console.log(name, room);

  name = name?.trim().toLowerCase();
  room = room?.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.room === room && user.name === name
  );

  if (!name || !room) return { error: "Username and room are required." };
  if (existingUser) return { error: "Username already exists." };

  const user = { id, name, room };

  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

// const UserResourceOptions = {
//   resource: User,
//   options: {
//     listProperties: ["id","_id", "username", "email"],
//     properties: { id: { isId: true } },
//     actions: {
//       edit: {
//         actionType: 'record',
//         component: false,
//         handler: (request, response, context) => {
//           const { record, currentAdmin } = context

//           console.log(context);
//           return {
//             record: record.toJSON(currentAdmin),
//             msg: 'Hello world',
//           }
//         },
//       },
//     },
//   },
// };

const mongooseDb = await mongoose.connect(config.mongoose.url);

const admin = new AdminJS({
  resources: [User,Song, Genre, Album, Playlist, Posts, Artist],
  rootPath: "/admin",
});



const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    cookieName: "adminjs",
    cookiePassword: "Samjeez419$",
    authenticate: async (email, password) => {
      const user = await User.findOne({ email });
      if (user) {
        const matched = await user.isPasswordMatch(password);
        if (matched) {
          if (user.role == "admin") {
            return user;
          }
        }
      }
      return false;
    },
  },
  null,
  // Add configuration required by the express-session plugin.
  {
    resave: true,
    saveUninitialized: true,
  }
);



app.use(admin.options.rootPath, adminRouter);

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(ExpressMongoSanitize());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// enable cors
app.use(cors());
app.options('*', cors());

// gzip compression
app.use(compression());

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

global.io = io;

global.io.on('connection', (socket) => {
  socket.on('join', ({ userId, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name: userId, room }); // add user with socket id and room info

    if (error) return callback(error);

    socket.join(user.room);

    global.io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room), // get user data based on user's room
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    console.log('disconnect');
    const user = removeUser(socket.id);
    if (user) {
      // socket.leave(user.room)
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

admin.watch();

server.listen(config.port, () => {
  logger.info(`Listening to port ${config.port}`);
});



// mongoose.connect(config.mongoose.url).then(() => {
//   logger.info("Connected to MongoDB");

//   const admin = new AdminJS({
//     resources: [UserResourceOptions, Song, Genre, Album, Playlist, Posts, Artist],
//     rootPath: "/admin",
//   });

//   const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
//     admin,
//     {
//       cookieName: "adminjs",
//       cookiePassword: "Samjeez419$",
//       authenticate: async (email, password) => {
//         const user = await User.findOne({ email });
//         if (user) {
//           const matched = await user.isPasswordMatch(password);
//           if (matched) {
//             if (user.role == "admin") {
//               return user;
//             }
//           }
//         }
//         return false;
//       },
//     },
//     null,
//     // Add configuration required by the express-session plugin.
//     {
//       resave: false,
//       saveUninitialized: true,
//     }
//   );

//   admin.watch();

//   app.use(admin.options.rootPath, adminRouter);

//   // // parse json request body
//   // app.use(express.json());

//   // // parse urlencoded request body
//   // app.use(express.urlencoded({ extended: true }));

//   // // sanitize request data
//   // app.use(xss());
//   // app.use(ExpressMongoSanitize());

//   // // jwt authentication
//   // app.use(passport.initialize());
//   // passport.use('jwt', jwtStrategy);

//   // if (config.env !== 'test') {
//   //   app.use(morgan.successHandler);
//   //   app.use(morgan.errorHandler);
//   // }

//   // // set security HTTP headers
//   // app.use(helmet());

//   // // enable cors
//   // app.use(cors());
//   // app.options('*', cors());

//   // // gzip compression
//   // app.use(compression());

//   // // limit repeated failed requests to auth endpoints
//   // if (config.env === 'production') {
//   //   app.use('/v1/auth', authLimiter);
//   // }

//   // // v1 api routes
//   // app.use('/v1', routes);

//   // // send back a 404 error for any unknown api request
//   // app.use((_req, _res, next) => {
//   //   next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
//   // });

//   // // convert error to ApiError, if needed
//   // app.use(errorConverter);

//   // // handle error
//   // app.use(errorHandler);

//   server = http.createServer(app);

//   // const io = new Server(server, {
//   //   pingTimeout: 60000,
//   //   cors: {
//   //     origin: '*',
//   //     methods: ['GET', 'POST'],
//   //   },
//   // });

//   // global.io = io;

//   // global.io.on('connection', (socket) => {
//   //   socket.on('join', ({ userId, room }, callback) => {
//   //     const { error, user } = addUser({ id: socket.id, name: userId, room }); // add user with socket id and room info

//   //     if (error) return callback(error);

//   //     socket.join(user.room);

//   //     global.io.to(user.room).emit('roomData', {
//   //       room: user.room,
//   //       users: getUsersInRoom(user.room), // get user data based on user's room
//   //     });

//   //     callback();
//   //   });

//   //   socket.on('sendMessage', (message, callback) => {
//   //     const user = getUser(socket.id);

//   //     io.to(user.room).emit('message', { user: user.name, text: message });

//   //     callback();
//   //   });

//   //   socket.on('disconnect', () => {
//   //     console.log('disconnect');
//   //     const user = removeUser(socket.id);
//   //     if (user) {
//   //       // socket.leave(user.room)
//   //       io.to(user.room).emit('roomData', {
//   //         room: user.room,
//   //         users: getUsersInRoom(user.room),
//   //       });
//   //     }
//   //   });
//   // });

//   server.listen(config.port, () => {
//     logger.info(`Listening to port ${config.port}`);
//   });
// });

// global.io.on('connection', WebSockets.connection);

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
