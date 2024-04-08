// jwt.middleware.ts

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    console.log("jwtMiddleware")
    const authHeader = req.headers['authorization'];
    if (!authHeader ) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    const token = req.headers['authorization'];
    console.log("jwt token",token)
    
    
    try {
      const decoded = this.jwtService.verify(token);
      req['userId'] = decoded.userId;
       // Attach the decoded user object to the request
       console.log(decoded.userId)
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
