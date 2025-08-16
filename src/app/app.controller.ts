import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Auth } from './decorators';
import { AuthType } from './enums/auth-type.enum';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Auth(AuthType?.None)
  @Get('/health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
