import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RuralPropertyEntity } from './rural-property.entity';
import { RuralPropertyRepository } from './rural-property.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RuralPropertyEntity])],
  providers: [RuralPropertyRepository],
  exports: [RuralPropertyRepository],
})
export class RuralPropertyPersistenceModule {}
