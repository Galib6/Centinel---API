import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { EmailOptions, EmailService } from "../../../helpers/email.service";
import { queuesConstants } from "../constants";

export interface EmailJobData extends EmailOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
}

@Processor(queuesConstants.emailQueue.name)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<any> {
    const { data } = job;
    this.logger.log(`Processing email job ${job.id} for ${data.to}`);

    try {
      const result = await this.emailService.sendEmail(data);

      if (result.success) {
        this.logger.log(
          `Email sent successfully. Job ID: ${job.id}, Message ID: ${result.messageId}`
        );
        return result;
      } else {
        this.logger.error(
          `Email sending failed. Job ID: ${job.id}, Error: ${result.error}`
        );
        throw new Error(result.error);
      }
    } catch (error) {
      this.logger.error(`Email job ${job.id} failed:`, error);
      throw error;
    }
  }
}
