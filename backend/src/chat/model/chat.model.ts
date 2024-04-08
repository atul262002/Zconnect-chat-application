import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  users: MongooseSchema.Types.ObjectId[];

  @Prop({ required: true })
  chatName: string;

  @Prop({ default: false })
  isGroup: boolean;

  @Prop()
  admin: string; // Assuming admin is the name of the user, you can change it to MongooseSchema.Types.ObjectId if admin is a user ID

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Message' })
  latestMessage?: MongooseSchema.Types.ObjectId;
  
  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
export type ChatDocument = Chat & Document;