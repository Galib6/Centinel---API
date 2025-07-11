import { Injectable, Logger } from "@nestjs/common";
import { ENV } from "@src/env";
import * as nodemailer from "nodemailer";
import {
  EmailTemplateContext,
  EmailTemplateHelper,
} from "../helpers/email-template.helper";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: EmailTemplateContext;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly emailTemplateHelper: EmailTemplateHelper) {
    this.initializeTransporter();
    this.emailTemplateHelper.registerHelpers();
  }

  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: ENV.smtp.smtpHost,
      port: parseInt(ENV.smtp.smtpPort),
      secure: parseInt(ENV.smtp.smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: ENV.smtp.smtpUser,
        pass: ENV.smtp.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error("SMTP connection failed:", error);
      } else {
        this.logger.log("SMTP server is ready to send emails");
      }
    });
  }

  /**
   * Sends an email using template or raw HTML
   * @param options - Email options
   * @returns Promise with send result
   */
  async sendEmail(options: EmailOptions): Promise<EmailSendResult> {
    try {
      let htmlContent = options.html;

      // If template is specified, render it
      if (options.template) {
        if (!this.emailTemplateHelper.templateExists(options.template)) {
          throw new Error(`Email template '${options.template}' not found`);
        }

        htmlContent = await this.emailTemplateHelper.renderTemplate(
          options.template,
          options.context || {}
        );
      }

      if (!htmlContent && !options.text) {
        throw new Error(
          "Either template, html, or text content must be provided"
        );
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: `"Meet API" <${ENV.smtp.smtpUser}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: htmlContent,
        text: options.text,
      };

      // Add optional fields
      if (options.cc) {
        mailOptions.cc = Array.isArray(options.cc)
          ? options.cc.join(", ")
          : options.cc;
      }

      if (options.bcc) {
        mailOptions.bcc = Array.isArray(options.bcc)
          ? options.bcc.join(", ")
          : options.bcc;
      }

      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Email sent successfully to ${options.to}. Message ID: ${result.messageId}`
      );

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);

      return {
        success: false,
        error: error.message,
      };
    }
  }
}
