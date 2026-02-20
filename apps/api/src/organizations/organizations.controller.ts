import {
  Controller, Get, Param,
  ParseIntPipe, UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags, ApiBearerAuth, ApiOperation,
  ApiParam, ApiOkResponse, ApiUnauthorizedResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { Organization } from './entities/organization.entity';

@ApiTags('Organizations')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'))
@Controller('organizations')
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @Get()
  @ApiOperation({
    summary:     'List all organizations',
    description: 'Returns all orgs with nested teams. Use IDs when registering users.',
  })
  @ApiOkResponse({ type: [Organization] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  findAll(): Promise<Organization[]> {
    return this.orgsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary:     'Get organization by ID',
    description: 'Returns org with its teams and users.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: Organization })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiNotFoundResponse({ description: 'Organization not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Organization> {
    return this.orgsService.findOne(id);
  }
}