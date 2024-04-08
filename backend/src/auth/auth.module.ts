import { Module} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {AuthController}  from './auth.controller';
import {AuthService}  from './auth.service';
import { User, UserSchema } from '../user/model/user.model';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { EmailService } from './email.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule ,ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule, // Include UserModule here
    
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to access environment variables
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Get the secret key from environment variables
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],

  providers: [AuthService,UserService,EmailService],
})

export class AuthModule {}
 