import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from './lead.entity';
import { LeadRepository } from './lead.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LeadEntity])],
  providers: [LeadRepository],
  exports: [LeadRepository],
})
export class LeadPersistenceModule {}
