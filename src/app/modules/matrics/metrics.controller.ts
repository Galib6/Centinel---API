import {
  Controller,
  Get,
  Headers,
  Logger,
  Request,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import * as promClient from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(
    @Headers('x-metrics-key') key: string,
    @Res() res: Response,
    @Request() req: any
  ): Promise<void> {
    // For debugging, log the key and request path
    Logger.log('🚀😬 ~ MetricsController ~ getMetrics ~ key:', key, 'path:', req.path);
    // If you want public access, comment out the next 3 lines
    if (process.env.METRICS_KEY && key !== process.env.METRICS_KEY) {
      throw new UnauthorizedException('Invalid metrics key');
    }
    res.setHeader('Content-Type', promClient.register.contentType);
    res.send(await promClient.register.metrics());
    return;
  }
}
