// @ts-nocheck
import mongoose from 'mongoose';
import app from './app';
import config from './config/config';
import logger from './modules/logger/logger';
import { Server } from 'socket.io';
import http from 'http';
import Notification from './modules/posts/notifications.model';
import WebSockets from './modules/utils/websockets';

let server: any;

const users = [];

const addUser = ({ id, name, room }) => {
  console.log(name, room);

  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find((user) => user.room === room && user.name === name);

  if (!name || !room) return { error: 'Username and room are required.' };
  if (existingUser) return { error: 'Username already exists.' };

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

mongoose.connect(config.mongoose.url).then(() => {
  logger.info('Connected to MongoDB');
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

  server.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

// global.io.on('connection', WebSockets.connection);

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
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

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
