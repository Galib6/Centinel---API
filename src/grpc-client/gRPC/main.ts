// import { Logger, ValidationPipe } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
// import { MicroserviceOptions } from '@nestjs/microservices';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { json, urlencoded } from 'body-parser';
// import { join } from 'path';
// import { AppModule } from './app/app.module';
// import { ENV } from './env';
// import { grpcServerConfig } from './gRPC/grpc.config';
// import { createLogger } from './logger';
// import { setupSecurity } from './security';
// import { setupSwagger } from './swagger';

// const logger = new Logger();

// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule, {
//     logger: ENV.isDevelopment ? createLogger() : ['error', 'warn', 'debug', 'log', 'verbose'],
//   });

//   app.connectMicroservice<MicroserviceOptions>(grpcServerConfig);
//   await app.startAllMicroservices();

//   app.setBaseViewsDir(join(process.cwd(), 'views'));
//   app.setViewEngine('hbs');

//   app.use(urlencoded({ extended: true }));
//   app.use(
//     json({
//       limit: '10mb',
//     })
//   );
//   app.useGlobalPipes(
//     new ValidationPipe({
//       transform: true,
//       whitelist: true,
//       forbidNonWhitelisted: true,
//     })
//   );

//   app.setGlobalPrefix(ENV.api.API_PREFIX);

//   setupSwagger(app);
//   setupSecurity(app);

//   await app.listen(ENV.port);

//   console.warn(
//     `\n\nVISA KNOWLEDGEBASE API ===>>\n\nNODE_VERSION: 'v22.12.0'\nNODE_ENV: ${
//       ENV.env
//     }\nRUNNING_ON: ${await app.getUrl()}\nAPI_DOCUMENTATION: ${await app.getUrl()}/docs\n\n`
//   );
// }
// bootstrap();
