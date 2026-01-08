import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { register } from 'tsconfig-paths';
import { resolve } from 'path';

config();

// Register tsconfig paths for TypeORM CLI
register({
  baseUrl: resolve(__dirname, '../../'),
  paths: {
    '@domain/*': ['domain/*'],
    '@application/*': ['application/*'],
    '@infrastructure/*': ['infrastructure/*'],
    '@interfaces/*': ['interfaces/*'],
  },
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'tm_digital_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: true,
});
