import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Team } from '../organizations/entities/team.entity';
import { Task } from '../tasks/entities/task.entity';
import { AuditLog } from '../audit/entities/audit-log.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { TasksModule } from '../tasks/tasks.module';
import { AuditModule } from '../audit/audit.module';
import { OrganizationsService } from '../organizations/organizations.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type:        'better-sqlite3',
        database:    'db.sqlite',
        entities:    [User, Organization, Team, Task, AuditLog],
        synchronize: true,
        logging:     config.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TasksModule,
    AuditModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private orgsService: OrganizationsService) {}
  async onModuleInit() {
    await this.orgsService.seed();
  }
}