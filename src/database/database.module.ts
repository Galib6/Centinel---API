import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ENV } from '@src/env';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: ENV.defaultDatabase.type,
        port: ENV.defaultDatabase.port,
        username: ENV.defaultDatabase.user,
        password: ENV.defaultDatabase.password,
        host: ENV.defaultDatabase.host,
        database: ENV.defaultDatabase.databaseName,
        logging: ENV.defaultDatabase.logging,
        entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
        migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
      }),
    }),
  ],
})
export class DatabaseModule {}
