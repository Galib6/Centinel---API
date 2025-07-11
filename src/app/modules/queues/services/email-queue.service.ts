import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import { EmailTemplateContext } from "../../../helpers/email-template.helper";
import { EmailOptions } from "../../../helpers/email.service";
import { queuesConstants } from "../constants";

export interface QueueEmailOptions extends EmailOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
}

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(
    @InjectQueue(queuesConstants.emailQueue.name)
    private readonly emailQueue: Queue
  ) {}

  /**
   * Adds an email job to the queue
   * @param emailOptions - Email options
   * @param jobOptions - Queue job options
   * @returns Promise with job result
   */
  async queueEmail(
    emailOptions: EmailOptions,
    jobOptions?: {
      priority?: number;
      delay?: number;
      attempts?: number;
    }
  ) {
    try {
      const job = await this.emailQueue.add(
        queuesConstants.emailQueue.jobNames.sendEmail,
        emailOptions,
        {
          priority: jobOptions?.priority || 0,
          delay: jobOptions?.delay || 0,
          attempts: jobOptions?.attempts || 3,
          backoff: {
            type: "exponential",
            delay: 5000,
          },
        }
      );

      this.logger.log(
        `Email job queued with ID: ${job.id} for ${emailOptions.to}`
      );
      return job;
    } catch (error) {
      this.logger.error("Failed to queue email:", error);
      throw error;
    }
  }

  /**
   * Queues a welcome email
   * @param userEmail - User's email
   * @param userName - User's name
   * @param verificationUrl - Optional verification URL
   * @param jobOptions - Queue job options
   */
  async queueWelcomeEmail(
    userEmail: string,
    userName: string,
    verificationUrl?: string,
    jobOptions?: { priority?: number; delay?: number; attempts?: number }
  ) {
    const emailOptions: EmailOptions = {
      to: userEmail,
      subject: "Welcome to Meet API!",
      template: "welcome",
      context: {
        userName,
        userEmail,
        verificationUrl,
        appName: "Meet API",
      },
    };

    return this.queueEmail(emailOptions, jobOptions);
  }

  /**
   * Queues a password reset email
   * @param userEmail - User's email
   * @param userName - User's name
   * @param otp - OTP code
   * @param resetUrl - Optional reset URL
   * @param expirationTime - OTP expiration time
   * @param jobOptions - Queue job options
   */
  async queuePasswordResetEmail(
    userEmail: string,
    userName: string,
    otp: string | number,
    resetUrl?: string,
    expirationTime: number = 5,
    jobOptions?: { priority?: number; delay?: number; attempts?: number }
  ) {
    const emailOptions: EmailOptions = {
      to: userEmail,
      subject: "Password Reset Request",
      template: "password-reset",
      context: {
        userName,
        otp,
        resetUrl,
        expirationTime,
        appName: "Meet API",
      },
    };

    return this.queueEmail(emailOptions, jobOptions);
  }

  /**
   * Queues an OTP verification email
   * @param userEmail - User's email
   * @param userName - User's name
   * @param otp - OTP code
   * @param expirationTime - OTP expiration time
   * @param jobOptions - Queue job options
   */
  async queueOtpVerificationEmail(
    userEmail: string,
    userName: string,
    otp: string | number,
    expirationTime: number = 5,
    jobOptions?: { priority?: number; delay?: number; attempts?: number }
  ) {
    const emailOptions: EmailOptions = {
      to: userEmail,
      subject: "Verification Code",
      template: "otp-verification",
      context: {
        userName,
        otp,
        expirationTime,
        appName: "Meet API",
      },
    };

    return this.queueEmail(emailOptions, jobOptions);
  }

  /**
   * Queues a template-based email
   * @param to - Recipient email(s)
   * @param subject - Email subject
   * @param templateName - Template name
   * @param context - Template context
   * @param jobOptions - Queue job options
   */
  async queueTemplateEmail(
    to: string | string[],
    subject: string,
    templateName: string,
    context: EmailTemplateContext,
    jobOptions?: { priority?: number; delay?: number; attempts?: number }
  ) {
    const emailOptions: EmailOptions = {
      to,
      subject,
      template: templateName,
      context,
    };

    return this.queueEmail(emailOptions, jobOptions);
  }

  /**
   * Queues an HTML email
   * @param to - Recipient email(s)
   * @param subject - Email subject
   * @param html - HTML content
   * @param text - Optional plain text content
   * @param jobOptions - Queue job options
   */
  async queueHtmlEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string,
    jobOptions?: { priority?: number; delay?: number; attempts?: number }
  ) {
    const emailOptions: EmailOptions = {
      to,
      subject,
      html,
      text,
    };

    return this.queueEmail(emailOptions, jobOptions);
  }

  /**
   * Gets email queue statistics
   */
  async getQueueStats() {
    const waiting = await this.emailQueue.getWaiting();
    const active = await this.emailQueue.getActive();
    const completed = await this.emailQueue.getCompleted();
    const failed = await this.emailQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length,
    };
  }

  /**
   * Clears completed jobs from the queue
   * @param gracePeriod - Grace period in milliseconds
   */
  async cleanCompletedJobs(gracePeriod: number = 24 * 60 * 60 * 1000) {
    await this.emailQueue.clean(gracePeriod, 100, "completed");
    this.logger.log("Cleaned completed email jobs");
  }

  /**
   * Clears failed jobs from the queue
   * @param gracePeriod - Grace period in milliseconds
   */
  async cleanFailedJobs(gracePeriod: number = 7 * 24 * 60 * 60 * 1000) {
    await this.emailQueue.clean(gracePeriod, 100, "failed");
    this.logger.log("Cleaned failed email jobs");
  }
}
