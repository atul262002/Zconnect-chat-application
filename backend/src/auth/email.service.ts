// email.service.ts

import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    console.log("this is email",email ,"this is v token", verificationToken)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
      auth: {
        user: 'nitesh.zecotok@gmail.com',
        pass: "qyzx pubt xsgy vevi",
      },
      });

      const url = `http://localhost:8080/api/auth/verify-email/${verificationToken}`; // Update with your domain

      await transporter.sendMail({
        from: process.env.EMAIL, // Sender email address
        to: email, // Recipient email address
        subject: 'Email Verification',
        text: `Please click the following link to verify your email: ${url}`,
      });

      console.log('Verification email sent successfully.');
    } catch (error) {
      throw new Error('Failed to send verification email.');
    }
  }

  
}
