import * as path from 'path';
import { ENV } from 'src/env';
import { DataSource } from 'typeorm';

const dataSourceConfig: any = {
  type: ENV.defaultDatabase.type,
  host: ENV.defaultDatabase.host,
  port: ENV.defaultDatabase.port,
  username: ENV.defaultDatabase.user,
  password: ENV.defaultDatabase.password,
  database: ENV.defaultDatabase.databaseName,
  synchronize: false,
  ssl: ENV.defaultDatabase.ssl
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
  logging: ['migration'],
  logger: ENV.config.isProduction ? 'file' : 'debug',
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
};

export default new DataSource(dataSourceConfig);
