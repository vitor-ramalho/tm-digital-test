import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './infrastructure/database/typeorm-config.service';
import { LeadsModule } from './interfaces/http/leads/leads.module';
import { RuralPropertiesModule } from './interfaces/http/rural-properties/rural-properties.module';
import { DashboardModule } from './interfaces/http/dashboard/dashboard.module';

/**
 * Application Root Module
 * Imports all feature modules and configures global dependencies
 */
@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Database configuration
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    // Feature modules
    LeadsModule,
    RuralPropertiesModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
