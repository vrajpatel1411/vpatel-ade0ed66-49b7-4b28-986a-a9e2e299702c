import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { Team } from './entities/team.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,

    @InjectRepository(Team)
    private teamRepo: Repository<Team>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.orgRepo.count();
    if (count > 0) {
      console.log('⏭️  Seed skipped — data already exists');
      return;
    }

    const org = await this.orgRepo.save(
      this.orgRepo.create({ name: 'Ecommerce' }),
    );

    const teams = await this.teamRepo.save([
      this.teamRepo.create({ name: 'Engineering', organizationId: org.id }),
      this.teamRepo.create({ name: 'Marketing',   organizationId: org.id }),
      this.teamRepo.create({ name: 'Design',      organizationId: org.id }),
    ]);

    console.log('✅ Seeded organization and teams:');
    console.log(`   Org  → id=${org.id}  name="${org.name}"`);
    teams.forEach(t =>
      console.log(`   Team → id=${t.id}  name="${t.name}"  orgId=${t.organizationId}`)
    );
    console.log('');
    console.log('   Use these IDs when calling POST /auth/register');
  }

  findAll(): Promise<Organization[]> {
    return this.orgRepo.find({
      relations: ['teams'],
      order:     { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Organization> {
    const org = await this.orgRepo.findOne({
      where:     { id },
      relations: ['teams', 'users'],
    });
    if (!org) throw new NotFoundException(`Organization #${id} not found`);
    return org;
  }
}