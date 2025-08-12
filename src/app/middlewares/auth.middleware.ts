import { Injectable, NestMiddleware } from "@nestjs/common";
import { JWTHelper } from "../helpers";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtHelper: JWTHelper) {}
  async use(_req: any, _res: Response, next: () => void): Promise<void> {
    // const token = this.jwtHelper.extractToken(req.headers);
    // if (token) {
    //   const verifiedUser: any = await this.jwtHelper.verify(token);
    //   req.verifiedUser = verifiedUser.user;
    // }
    next();
  }
}
