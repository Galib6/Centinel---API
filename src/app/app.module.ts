import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { RateLimitModule } from "@src/app/modules/throttler/rateLimit.module";
import { DatabaseModule } from "@src/database/database.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ExceptionFilter } from "./filters";
import { GuardsModule } from "./guards/gaurds.module";
import { HelpersModule } from "./helpers/helpers.module";
import { ActiveUserInserter } from "./interceptors/audit.interceptor";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { AuthMiddleware } from "./middlewares";
import { AuthModule } from "./modules/auth/auth.module";
import { GalleryModule } from "./modules/galleries/gallery.module";
import { BullBoardModule } from "./modules/queues/bullBoard.module";
import { QueueModule } from "./modules/queues/queue.module";
import { RedisModule } from "./modules/redis/redis.module";
import { LogCleanupService } from "./services";

const MODULES = [
  DatabaseModule,
  HelpersModule,
  AuthModule,
  GalleryModule,
  QueueModule,
  RedisModule,
  BullBoardModule,
  // KafkaModule,
];
@Module({
  imports: [
    ...MODULES,
    GuardsModule,
    RateLimitModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    LogCleanupService,
    { provide: APP_FILTER, useClass: ExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ActiveUserInserter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: "/*path", method: RequestMethod.ALL });
  }
}
