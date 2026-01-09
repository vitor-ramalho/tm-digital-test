import { Module } from '@nestjs/common';
import { LeadPersistenceModule } from './leads/lead-persistence.module';
import { RuralPropertyPersistenceModule } from './rural-properties/rural-property-persistence.module';

@Module({
  imports: [LeadPersistenceModule, RuralPropertyPersistenceModule],
  exports: [LeadPersistenceModule, RuralPropertyPersistenceModule],
})
export class PersistenceModule {}
