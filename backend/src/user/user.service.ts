import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './model/user.model';
import { CreateUserDto } from './dto/createuser.dto';
import { LoginDto } from './dto/loginuser.dto';
import { MongoError } from 'mongodb';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const { username, email, password, image } = createUserDto;

      // Generate a salt to hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new this.userModel({ username, email, password: hashedPassword, image });
      return await newUser.save();
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        // Handle duplicate key error (unique constraint violation)
        throw new ConflictException('Email or username already exists.');
      } else {
        // Handle other types of errors
        throw new Error('Failed to create user.');
      }
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByVerificationToken(verificationToken: string): Promise<UserDocument> {
    return this.userModel.findOne({ verificationToken }).exec();
  }

  async comparePassword(logindto: LoginDto): Promise<boolean> {
    const { email, password } = logindto;
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      return false; // User not found
    }

    // Compare the provided password with the hashed password stored in the database
    return await bcrypt.compare(password, user.password);
  }

  async searchUser(searchTerm: string, offset: number): Promise<User[]> {
    try {
      const users = await this.userModel
        .find({ username: { $regex: searchTerm, $options: 'i' } })
        .select('-password -verificationToken')
        .skip(offset)
        .limit(10)
        .exec();

      return users;
    } catch (error) {
      throw new Error('Failed to search for users.');
    }
  }

  async getUserProfile(userId: string): Promise<User> {
    try {
      // Find the user by userId
      const user = await this.userModel.findById(userId).select('-password -verificationToken -__v').exec();

      // If user is not found, throw NotFoundException
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Return the user profile
      return user;
    } catch (error) {
      throw new Error('Failed to fetch user profile.');
    }
  }
}
