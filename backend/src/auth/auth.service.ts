import { Injectable, ConflictException ,UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/createuser.dto';
import { LoginDto } from 'src/user/dto/loginuser.dto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService ,
    private readonly emailService: EmailService ,
    private readonly jwtService: JwtService) {}

  async register(createUserDto: CreateUserDto): Promise<any> {
    try {
      const user =await this.userService.create(createUserDto);
      
      const verificationToken = await this.generateVerificationToken();
      console.log("this is verification token " ,verificationToken)
      user.verificationToken = verificationToken;
      await user.save();

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, verificationToken);

    } catch (error) {
      if (error instanceof ConflictException) {
        
        throw error; // Rethrow the ConflictException to handle it in the controller
      } else {
        throw new Error('Failed to register user.'); // Handle other types of errors
      }
    }
  }
  async verifyEmail(verificationToken: string): Promise<void> {
    try {
      const user = await this.userService.findByVerificationToken(verificationToken);

      if (!user) {
        throw new Error('Invalid or expired token.');
      }

      user.status = 'Active';
      await user.save();
    } catch (error) {
      throw error;
    }
  }
  async generateVerificationToken(): Promise<string> {
    try {
      const randomBytesAsync = promisify(randomBytes);
      const token = (await randomBytesAsync(20)).toString('hex');
      return token;
    } catch (error) {
      throw new Error('Failed to generate verification token.');
    }


}
async login(loginDto: LoginDto): Promise<{ token: string; expiresIn: number }> {
  const { email, password } = loginDto;

  // Find the user by email
  const user = await this.userService.findByEmail(email);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials.');
  }

  // Check if the provided password matches the hashed password
  const isPasswordValid = await this.userService.comparePassword({
    email,
    password,
  });
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials.');
  }

  // Generate JWT token
  const payload = { userId: user._id};
  const token = await this.generateJwtToken(payload);
  console.log(token)

  return {
    token,
    expiresIn: 3600, // Token expiration time in seconds (1 hour)
  };
}
async generateJwtToken(payload: any): Promise<string> {
  return this.jwtService.sign(payload);
}

}