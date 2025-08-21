import { Module } from '@nestjs/common';
import { RabbitMqController } from './controller/rabbitMQ.controller';

@Module({
  imports: [],
  providers: [],
  controllers: [RabbitMqController],
  exports: [],
})
export class RabbitMQModule {}
