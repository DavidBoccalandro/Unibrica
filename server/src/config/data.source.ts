/* eslint-disable prettier/prettier */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

ConfigModule.forRoot({
  envFilePath: !process.env.NODE_ENV
    ? '.env'
    : `.${process.env.NODE_ENV}.env`,
})

const configService = new ConfigService();

console.log('NODE_ENV: ', process.env.NODE_ENV)
console.log('CONFIG DB: ', configService.get('DB_HOST'), configService.get('DB_USER'), configService.get('DB_NAME'))
export const DataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [__dirname + '/../**/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: true,
  migrationsRun: true,
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
  ssl: configService.get('POSTGRESS_SSL') === "true",
      extra: {
        ssl:
          configService.get('POSTGRESS_SSL') === "true"
            ? {
                rejectUnauthorized: false,
              }
            : null,
      },

};

export const AppDS = new DataSource(DataSourceConfig);
