// create-chat.dto.ts
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  chatName: string;

  @IsArray()
  @IsMongoId({ each: true })
  users: string[];

  @IsNotEmpty()
  @IsBoolean()
  isGroup: boolean;

  @IsMongoId()
  admin: string;
}
