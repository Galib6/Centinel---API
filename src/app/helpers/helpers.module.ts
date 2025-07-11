import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { BcryptHelper } from "./bcrypt.helper";
import { EmailTemplateHelper } from "./email-template.helper";
import { EmailService } from "./email.service";
import { JWTHelper } from "./jwt.helper";
import { QueryHelper } from "./query.helper";

const HELPERS = [
  BcryptHelper,
  JWTHelper,
  QueryHelper,
  EmailTemplateHelper,
  EmailService,
];

@Module({
  imports: [JwtModule],
  providers: [...HELPERS],
  exports: [...HELPERS],
})
export class HelpersModule {}
