import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  OnModuleDestroy,
  Post,
  Request,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '@src/app/decorators';
import { AuthType } from '@src/app/enums/auth-type.enum';
import { Observable, lastValueFrom } from 'rxjs';
import { LoginDTO } from '../dtos';

interface IAuthService {
  login(data: { email: string; password: string }): Observable<any>;
  refreshToken(data: { refresh_token: string }): Observable<any>;
  logout(data: { user_id: string; token: string }): Observable<any>;
}

@Auth(AuthType.None)
@ApiTags('Auth Grpc')
@Controller('/grpc/auth')
export class AuthGrpcController implements OnModuleDestroy {
  private authService: IAuthService;

  constructor(@Inject('AUTH_SERVICE') private client: ClientGrpc) {}

  onModuleInit(): void {
    this.authService = this.client.getService<IAuthService>('AuthService');
  }

  onModuleDestroy(): void {
    // gRPC client will be automatically cleaned up by NestJS
    // when the module is destroyed
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() @Body() body: LoginDTO): Promise<any> {
    return await lastValueFrom(this.authService.login(body));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshDto: { refresh_token: string }): Promise<any> {
    return await lastValueFrom(this.authService.refreshToken(refreshDto));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req, @Body() body: { token: string }): Promise<any> {
    return await lastValueFrom(
      this.authService.logout({
        user_id: req.user.id,
        token: body.token,
      })
    );
  }
}
