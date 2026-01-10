import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuralPropertiesController } from './rural-properties.controller';
import { CreateRuralPropertyService } from '@application/use-cases/rural-properties/create-rural-property.service';
import { UpdateRuralPropertyService } from '@application/use-cases/rural-properties/update-rural-property.service';
import { DeleteRuralPropertyService } from '@application/use-cases/rural-properties/delete-rural-property.service';
import { GetRuralPropertyService } from '@application/use-cases/rural-properties/get-rural-property.service';
import { ListRuralPropertiesService } from '@application/use-cases/rural-properties/list-rural-properties.service';
import { GetRuralPropertyStatisticsService } from '@application/use-cases/rural-properties/get-rural-property-statistics.service';
import { RuralPropertyRepository } from '@infrastructure/persistence/rural-properties/rural-property.repository';
import { LeadRepository } from '@infrastructure/persistence/leads/lead.repository';
import { RuralPropertyEntity } from '@infrastructure/persistence/rural-properties/rural-property.entity';
import { LeadEntity } from '@infrastructure/persistence/leads/lead.entity';

/**
 * Rural Properties Module
 * Provides all dependencies for rural property management
 */
@Module({
  imports: [TypeOrmModule.forFeature([RuralPropertyEntity, LeadEntity])],
  controllers: [RuralPropertiesController],
  providers: [
    // Application Services (Use Cases)
    CreateRuralPropertyService,
    UpdateRuralPropertyService,
    DeleteRuralPropertyService,
    GetRuralPropertyService,
    ListRuralPropertiesService,
    GetRuralPropertyStatisticsService,
    // Infrastructure Repositories
    RuralPropertyRepository,
    LeadRepository,
  ],
  exports: [
    CreateRuralPropertyService,
    UpdateRuralPropertyService,
    DeleteRuralPropertyService,
    GetRuralPropertyService,
    ListRuralPropertiesService,
    GetRuralPropertyStatisticsService,
  ],
})
export class RuralPropertiesModule {}
