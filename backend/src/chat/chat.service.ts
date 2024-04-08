import { Injectable, BadRequestException,NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatDto } from './dto/createChat.dto';
import { Chat } from './model/chat.model';
import { Message } from './model/message.model';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    const { chatName, users, isGroup, admin } = createChatDto;

    // Check if the chat already exists
    const existingChat = await this.chatModel.findOne({ users: { $all: users } });
    if (existingChat) {
      return existingChat;
    }

    const newChat = new this.chatModel({
      chatName,
      users,
      isGroup,
      admin,
    });

    try {
      return await newChat.save();
    } catch (error) {
      throw new BadRequestException('Failed to create chat.');
    }
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      // Find all chats that include the given user ID
      const chats = await this.chatModel.find({ users: userId }).populate({
        path: 'users',
        select: ' _id username email image',
      }).populate({
        path: 'latestMessage',
        
      }).exec();
      // Sort the chats based on the timestamp of the latest message
      // chats.sort((a, b) => {
      //   if (!a.latestMessage && !b.latestMessage) return 0; // Both chats have no latestMessage
      //   if (!a.latestMessage) return 1; // If a has no latestMessage, it should be placed after b
      //   if (!b.latestMessage) return -1; // If b has no latestMessage, it should be placed after a
      //   // Sort based on createdAt timestamp, latest message on top
      //   return b.latestMessage.createdAt.getTime() - a.latestMessage.createdAt.getTime();
      // });
      return chats;
    } catch (error) {
      throw new BadRequestException('Failed to fetch user chats.');
    }
  }

  async createMessage(chatId: string, senderId: string, content: string): Promise<void> {
    try {
      // Create a new message instance
      const newMessage = new this.messageModel({
        chatId,
        senderId,
        content,
      });

      // Save the message to the database
      await newMessage.save();

      // Update the chat's latestMessage
      await this.chatModel.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });
    } catch (error) {
      throw new BadRequestException('Failed to create message.');
    }
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      // Fetch messages related to the specified chat
      const messages = await this.messageModel.find({ chatId }).sort({ createdAt: 'asc' }).exec();
      return messages;
    } catch (error) {
      throw new BadRequestException('Failed to fetch chat messages.');
    }
  }
  async getChatById(chatId: string): Promise<Chat> {
    try {
      // Find the chat by its ID
      const chat = await this.chatModel.findById(chatId).exec();

      // If chat is not found, throw NotFoundException
      if (!chat) {
        throw new NotFoundException('Chat not found.');
      }

      return chat;
    } catch (error) {
      throw new BadRequestException('Failed to fetch chat by ID.');
    }
  }
}
