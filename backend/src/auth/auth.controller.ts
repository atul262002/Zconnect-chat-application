import { Controller, Post, Body, Res, HttpStatus,Param ,Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/createuser.dto';
import { LoginDto } from 'src/user/dto/loginuser.dto';
import { ConflictException ,NotFoundException } from '@nestjs/common';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res) {
    try {
      console.log("create user dto",createUserDto)
      // Check if required fields are present
      if (!createUserDto.username || !createUserDto.email || !createUserDto.password) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Please provide username, email, and password.',
        });
      }

      await this.authService.register(createUserDto);
      return res.status(HttpStatus.OK).json({
        message: 'Successful registration. Check email for verification.',
      });
    } catch (error) {
      console.error('Error during registration:', error);
      if (error instanceof ConflictException) {
        // Handle duplicate key error (user already exists)
        return res.status(HttpStatus.CONFLICT).json({
          message: error.message,
        });
      } else if (error.response && error.response.message === 'Validation error.') {
        // Handle validation errors
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.response.message,
          errors: error.response.errors,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An unexpected error occurred.',
      });
    }
  }
  @Get('verify-email/:verificationToken')
  async verifyEmail(@Param('verificationToken') verificationToken: string, @Res() res) {
    try {
      await this.authService.verifyEmail(verificationToken);
      
      return res.status(HttpStatus.OK).json({
        message: 'Email successfully verified.',
      });
    } catch (error) {
      console.error('Error during email verification:', error);
      if (error instanceof NotFoundException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An unexpected error occurred.',
      });
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res) {
    try {
      const { email, password } = loginDto;
      const token = await this.authService.login(loginDto);
      return res.status(HttpStatus.OK).json({
        token: token,
        expires_in: 'expiration_time_in_seconds' // Replace with actual expiration time
      });
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Invalid credentials.'
      });
    }
  }

  
}
