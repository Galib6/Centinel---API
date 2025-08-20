import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { RequestMetricsMiddleware } from './request-metrics.middleware';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true, // exposes app process metrics like heap usage, event loop lag
      },
    }),
  ],
  controllers: [MetricsController],
})
export class MetricsModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestMetricsMiddleware).forRoutes('/*path');
  }
}
