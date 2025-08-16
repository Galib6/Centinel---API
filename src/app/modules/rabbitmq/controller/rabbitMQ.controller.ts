import { Controller, Get } from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { Auth } from "@src/app/decorators";
import { AuthType } from "@src/app/enums/auth-type.enum";
import { firstValueFrom } from "rxjs";

@Auth(AuthType.None)
@Controller()
export class RabbitMqController {
  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://localhost:5672"],
        queue: "test_queue",
        queueOptions: { durable: false },
      },
    });
  }
  private client: ClientProxy;

  @Get("send")
  async sendMessage(): Promise<any> {
    try {
      return await firstValueFrom(
        this.client.send("user.created", { msg: "Hello from publisher" }),
      );
    } catch (error) {
      // Log the error for debugging
      console.error("RabbitMQ send error:", error);
      throw error; // Rethrow to let Nest handle it
    }
  }
}
