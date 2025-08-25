// import { GrpcOptions, Transport } from "@nestjs/microservices";
// import { join } from "path";

// export const grpcServerConfig: GrpcOptions = {
//   transport: Transport.GRPC,
//   options: {
//     package: ["auth", "common"],
//     protoPath: join(process.cwd(), "src/gRPC/proto/auth.proto"),
//     url: process.env.AUTH_GRPC_URL || "0.0.0.0:50051",

//     // Server-side performance settings
//     maxSendMessageLength: 1024 * 1024 * 4, // 4MB
//     maxReceiveMessageLength: 1024 * 1024 * 4, // 4MB

//     // Server keepalive settings (matching your client)
//     keepalive: {
//       keepaliveTimeMs: 30000,
//       keepaliveTimeoutMs: 5000,
//       keepalivePermitWithoutCalls: 1,
//       http2MaxPingsWithoutData: 0,
//       http2MinTimeBetweenPingsMs: 10000,
//       http2MinPingIntervalWithoutDataMs: 300000,
//     },

//     // Server channel options
//     channelOptions: {
//       "grpc.keepalive_time_ms": 30000,
//       "grpc.keepalive_timeout_ms": 5000,
//       "grpc.keepalive_permit_without_calls": 1,
//       "grpc.http2.max_pings_without_data": 0,
//       "grpc.http2.min_time_between_pings_ms": 10000,
//       "grpc.http2.min_ping_interval_without_data_ms": 300000,
//       "grpc.max_connection_idle_ms": 30000,
//       "grpc.max_connection_age_ms": 300000,
//       "grpc.max_connection_age_grace_ms": 5000,

//       // Additional server settings
//       "grpc.so_reuseaddr": 1,
//       "grpc.max_concurrent_streams": 1000,
//       "grpc.initial_reconnect_backoff_ms": 1000,
//       "grpc.max_reconnect_backoff_ms": 120000,
//     },
//   },
// };
