import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { HelpersModule } from "@src/app/helpers/helpers.module";
import { ENV } from "@src/env";

import { queuesConstants } from "./constants";
import { EmailProcessor } from "./processors/email.processor";
import { CountryPurVisaCatServiceDocProcessor } from "./processors/example.processor";
import { EmailQueueService } from "./services/email-queue.service";
import { QueueService } from "./services/queue.service";

const processors = [CountryPurVisaCatServiceDocProcessor, EmailProcessor];
const services = [QueueService, EmailQueueService];
const modules = [HelpersModule];

const defaultJobOptions = {
  attempts: 5, // Number of retry attempts
  backoff: {
    type: "exponential", // every retries it will wait exponential at delay time
    delay: 5000, // Delay in milliseconds
  },
};

@Module({
  imports: [
    ...modules,
    BullModule.forRoot({
      connection: {
        host: ENV.redis.host,
        username: ENV.redis.username,
        password: ENV.redis.password,
        port: ENV.redis.port,
      },
    }),
    BullModule.registerQueue({
      name: queuesConstants.defaultQueue.name,
      defaultJobOptions,
    }),
    BullModule.registerQueue({
      name: queuesConstants.emailQueue.name,
      defaultJobOptions,
    }),
  ],
  providers: [...services, ...processors],
  exports: [...services],
})
export class QueueModule {}
