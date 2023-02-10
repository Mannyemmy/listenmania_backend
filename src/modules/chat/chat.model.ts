import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const CHAT_ROOM_TYPES = {
  CONSUMER_TO_CONSUMER: 'consumer-to-consumer',
  CONSUMER_TO_SUPPORT: 'consumer-to-support',
};

const chatRoomSchema = new mongoose.Schema(
  {
    userIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    chatInitiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'chatrooms',
  }
);

chatRoomSchema.statics['initiateChat'] = async function (userIds, chatInitiator) {
  try {
    const availableRoom = await this.findOne({
      userIds: {
        $size: userIds.length,
        $all: [...userIds],
      },
    });
    if (availableRoom) {
      return {
        isNew: false,
        message: 'retrieving an old chat room',
        chatRoomId: availableRoom._doc._id,
      };
    }

    const newRoom = await this.create({ userIds, chatInitiator });
    return {
      isNew: true,
      message: 'creating a new chatroom',
      chatRoomId: newRoom._doc._id,
    };
  } catch (error) {
    console.log('error on start chat method', error);
    throw error;
  }
};

chatRoomSchema.statics['getChatRoomByRoomId'] = async function (roomId) {
    try {
      const room = await this.findOne({ _id: roomId }).populate({
        path: 'userIds',
        select: 'id _id username profile_pic firstname lastname location',
      });
      return room;
    } catch (error) {
      console.log(error, 'ore')
      throw error;
    }
  }

  chatRoomSchema.statics['getChatRoomsByUserId'] = async function (userId) {
    try {
      const rooms = await this.find({ 'userIds': { $all: [userId] } });
      return rooms;
    } catch (error) {
      throw error;
    }
  }

export default mongoose.model('ChatRoom', chatRoomSchema);
