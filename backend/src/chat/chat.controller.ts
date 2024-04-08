import { Body, Controller, Post, Get, Req, Param, NotFoundException,BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { CreateChatDto } from './dto/createChat.dto';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/createMessage.dto';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getUserChats(@Req() req) {
    try {
      const userId = req.userId;
      return this.chatService.getUserChats(userId);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user chats');
    }
  }

  @Post('create')
  async createChat(@Body() createChatDto: CreateChatDto, @Req() req): Promise<any> {
    try {
      createChatDto.users.push(req.userId);
      const chat = await this.chatService.createChat(createChatDto);
      if (!chat) {
        throw new BadRequestException('Chat already exists');
      }
      return chat;
    } catch (error) {
      throw new BadRequestException('Failed to create chat');
    }
  }
  
  @Post('create-message/:chatId')
  async createMessage(
    @Param('chatId') chatId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req
  ) {
    try {
      const senderId = createMessageDto.senderId;
      const content = createMessageDto.content;
      await this.chatService.createMessage(chatId, senderId, content);
      return { message: 'Message created successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create message');
    }
  }

  @Get('message/:chatId')
  async getChatMessages(
    @Param('chatId') chatId: string,
  ) {
    try {
      const messages = await this.chatService.getChatMessages(chatId);
      return { messages };
    } catch (error) {
      if (error.name === 'NotFound') {
        throw new NotFoundException('Chat not found');
      }
      throw new InternalServerErrorException('Failed to fetch chat messages');
    }
  }
}
