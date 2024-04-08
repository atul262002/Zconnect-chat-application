import { Module,MiddlewareConsumer, RequestMethod  } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from 'src/user/user.service';
import { User ,UserSchema } from 'src/user/model/user.model';
import { Chat ,ChatSchema } from './model/chat.model';
import { Message ,MessageSchema } from './model/message.model';
import { JwtMiddleware } from 'src/Middleware/jwt.middlware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './socket/chat.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },{name: Message.name, schema: MessageSchema},{name: Chat.name, schema: ChatSchema}]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to access environment variables
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get the secret key from environment variables
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [UserService,JwtMiddleware,ChatService,ChatGateway],
})
export class ChatModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: '/api/chat',method: RequestMethod.ALL },{ path: '/api/chat/create',method: RequestMethod.ALL },
      { path: '/api/chat/create-message/:chatId',method: RequestMethod.ALL },{ path: '/api/chat/message/:chatId',method: RequestMethod.ALL });
  }
}

 