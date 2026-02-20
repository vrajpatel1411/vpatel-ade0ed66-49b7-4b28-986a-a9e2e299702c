import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Team } from './entities/team.entity';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Team]),
  ],
  providers:   [OrganizationsService],
  controllers: [OrganizationsController],
  exports:     [OrganizationsService],
})
export class OrganizationsModule {}