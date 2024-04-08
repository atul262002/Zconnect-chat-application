import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User  {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop() // Provide a default value or set to undefined
  verificationToken ?: string; 

  @Prop({ enum: ['Active', 'Pending'], default: 'Pending' })
  status?: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;

  @Prop()
  image?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document; // Export UserDocument type
