import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GoogleOAuthGuard } from "@src/app/modules/auth/guards/googleAuth/google.guard";
import { HelpersModule } from "../../helpers/helpers.module";
import { QueueModule } from "../queues/queue.module";
import { AclModule } from "./../acl/acl.module";
import { UserModule } from "./../user/user.module";
import { AuthController } from "./controllers/auth.controller";
import { WebAuthController } from "./controllers/auth.web.controller";
import { AuthStat } from "./entities/authStat.entity";
import { AuthService } from "./services/auth.service";
import { AuthStatService } from "./services/authStat.service";
import { GoogleStrategy } from "./strategies/google.strategy";

const entities = [AuthStat];
const services = [AuthStatService, AuthService, GoogleStrategy];
const subscribers = [];
const controllers = [AuthController];
const webControllers = [WebAuthController];
const modules = [HttpModule, HelpersModule, UserModule, AclModule, QueueModule];
const guards = [GoogleOAuthGuard];

@Module({
  imports: [TypeOrmModule.forFeature(entities), ...modules],
  providers: [...services, ...subscribers, ...guards],
  exports: [...services, ...subscribers],
  controllers: [...controllers, ...webControllers],
})
export class AuthModule {}
