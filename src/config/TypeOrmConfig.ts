import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { envs } from './envs';

export const typeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: envs.database_url,
  /*host: configService.get('DATABASE_HOST'),
  port: envs.database_url,
  username: envs.database_url,
  password: envs.database_url,
  database: envs.database_url, */
  logging: false,
  autoLoadEntities: true,
  synchronize: true,
});
