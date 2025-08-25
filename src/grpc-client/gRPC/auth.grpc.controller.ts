// import { Body, Controller } from "@nestjs/common";
// import { GrpcMethod } from "@nestjs/microservices";
// import { LoginDTO } from "../dtos";
// import { AuthService } from "../services/auth.service";

// @Controller()
// // @UseInterceptors(LoggingInterceptor)
// // @UseFilters(AllRpcExceptionsFilter)
// export class AuthGrpcController {
//   constructor(private readonly authService: AuthService) {}

//   @GrpcMethod("AuthService", "Login")
//   async loginUser(@Body() body: LoginDTO) {
//     console.log("🚀😬 ~ AuthController ~ loginUser ~ body:", body);
//     return this.authService.loginUser(body);
//   }

//   //   @GrpcMethod("AuthService", "ValidateToken")
//   //   async validateToken(
//   //     data: ValidateTokenRequest
//   //   ): Promise<ValidateTokenResponse> {
//   //     return await this.authService.validateToken(data);
//   //   }

//   //   @GrpcMethod("AuthService", "RefreshToken")
//   //   async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
//   //     return await this.authService.refreshToken(data);
//   //   }

//   //   @GrpcMethod("AuthService", "Logout")
//   //   async logout(
//   //     data: LogoutRequest
//   //   ): Promise<{ success: boolean; message: string; code: number }> {
//   //     return await this.authService.logout(data);
//   //   }
// }
