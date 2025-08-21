// request-metrics.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';

const httpRequestsTotal = new Counter({
  name: 'nestjs_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new Histogram({
  name: 'nestjs_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5], // duration buckets
});

const activeRequests = new Gauge({
  name: 'nestjs_active_requests',
  help: 'Number of active HTTP requests',
});

@Injectable()
export class RequestMetricsMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void): void {
    activeRequests.inc();
    const end = httpRequestDuration.startTimer();

    res.on('finish', () => {
      httpRequestsTotal
        .labels(req.method, req.route?.path || req.url, res.statusCode.toString())
        .inc();

      end({ method: req.method, route: req.route?.path || req.url, status: res.statusCode });

      activeRequests.dec();
    });

    next();
  }
}
