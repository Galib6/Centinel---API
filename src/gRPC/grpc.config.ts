import { ClientsModuleOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientsConfig: ClientsModuleOptions = [
  {
    name: 'AUTH_SERVICE',
    transport: Transport.GRPC,
    options: {
      package: ['auth', 'common'],
      protoPath: join(process.cwd(), 'src/gRPC/proto/auth.proto'),
      url: process.env.AUTH_SERVICE_URL || 'localhost:50051',
      keepalive: {
        keepaliveTimeMs: 30000,
        keepaliveTimeoutMs: 5000,
        keepalivePermitWithoutCalls: 1,
        http2MaxPingsWithoutData: 0,
        http2MinTimeBetweenPingsMs: 10000,
        http2MinPingIntervalWithoutDataMs: 300000,
      },
      channelOptions: {
        'grpc.keepalive_time_ms': 30000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': 1,
        'grpc.http2.max_pings_without_data': 0,
        'grpc.http2.min_time_between_pings_ms': 10000,
        'grpc.http2.min_ping_interval_without_data_ms': 300000,
        'grpc.max_connection_idle_ms': 30000,
        'grpc.max_connection_age_ms': 300000,
        'grpc.max_connection_age_grace_ms': 5000,
      },
    },
  },
];
