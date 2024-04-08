import { ConnectedSocket, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from '../chat.service';
import { ApiError } from '../../helper/api-error'; // Corrected import path
import { ChatEvents } from '../../helper/socket.const';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private userSocketMap = new Map<string, string[]>();

  constructor(private jwtService: JwtService, private chatService: ChatService) {}

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      let token = socket.handshake.headers.authorization;

      if (!token) {
        token = socket.handshake.auth?.token;
      }

      if (!token) {
        throw new ApiError(401, 'Un-authorized handshake. Token is missing');
      }

      const decodedToken = this.jwtService.verify(token);
      const userId = decodedToken.userId;

      if (!userId) {
        throw new ApiError(401, 'Un-authorized handshake. Token is invalid');
      }

      const existingSocketIds = this.userSocketMap.get(userId) || [];
      existingSocketIds.push(socket.id);
      this.userSocketMap.set(userId, existingSocketIds);

      socket.data.userId = userId;
      
      socket.emit(ChatEvents.CONNECTED_EVENT);
      console.log('User connected. userId:', userId);

      this.userSocketMap.get(userId).forEach((socketId) => {
        this.server.to(socketId).emit(ChatEvents.CONNECTED_EVENT, `${userId} ---> ${socket.id}`);
      });
      console.log(this.userSocketMap);

      socket.on(ChatEvents.NEW_MESSAGE_SEND, async (data) => {
        try {
          // const { content, chat, sender } = JSON.parse(data);
          const { content, chat, sender } = data;
          console.log("meesgae recieve on server")
          if (!content || !chat || !sender) {
            throw new ApiError(400, "Invalid message data");
          }
         
          // Find the chat and retrieve the users
          const chatData = await this.chatService.getChatById(chat);
          console.log(chatData)
          const usersInChat = chatData ? chatData.users : [];
          console.log(usersInChat)
          const usersInChatStr = usersInChat.map(objectId => objectId.toString());

          // Now usersInChat contains an array of string representations of ObjectId because map userid having string
          console.log(usersInChatStr);
          
          if (!usersInChatStr || usersInChatStr.length === 0) {
            throw new ApiError(400, "No users found in the specified chat");
          }

          // Iterate through the users and send the message to all their sockets
          usersInChatStr.forEach(async (userId) => {
            const userSocketIds = this.userSocketMap.get(userId);
            if (userSocketIds) {
                for (const socketId of userSocketIds) {
                    console.log(`This is message socket ${socketId}`);
                    console.log(`Emitting MessageReceive event to ${socketId} with data:`, { sender, content, chat });
                    await this.server.to(socketId).emit(ChatEvents.NEW_MESSAGE_RECEIVE, { sender, content, chat });
                }
            }
        });
        
          await this.chatService.createMessage(chat ,sender ,content)

          console.log(`Message broadcasted to chatId ${chat} by userId ${sender}`);
        } catch (error) {
          socket.emit(
            ChatEvents.SOCKET_ERROR_EVENT,
            error?.message || "Something went wrong while handling the message event."
          );
        }
      });

      socket.on(ChatEvents.DISCONNECT_EVENT, () => {
        console.log('User has disconnected. userId:', socket.data.userId, socket.id);
        if (socket.data.userId) {
          const updatedSocketIds = this.userSocketMap.get(socket.data.userId).filter((id) => id !== socket.id);
          this.userSocketMap.set(socket.data.userId, updatedSocketIds);
          console.log('User Socket Map:', Array.from(this.userSocketMap));
        }
      });
    } catch (error) {
      socket.emit(ChatEvents.SOCKET_ERROR_EVENT, error?.message || 'Something went wrong while connecting to the socket.');
    }
  }
}
