import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadsDto } from './dto/filter-leads.dto';
import { CreateLeadService } from '@application/use-cases/leads/create-lead.service';
import { UpdateLeadService } from '@application/use-cases/leads/update-lead.service';
import { DeleteLeadService } from '@application/use-cases/leads/delete-lead.service';
import { GetLeadService } from '@application/use-cases/leads/get-lead.service';
import { ListLeadsService } from '@application/use-cases/leads/list-leads.service';
import { GetPriorityLeadsService } from '@application/use-cases/leads/get-priority-leads.service';
import { GetLeadStatisticsService } from '@application/use-cases/leads/get-lead-statistics.service';
import { Lead } from '@domain/leads/lead.entity';

/**
 * REST Controller for Lead management
 * Handles all HTTP requests related to leads
 *
 * Routes:
 * - GET /leads - List all leads with optional filters
 * - GET /leads/priority - Get high-priority leads (area > 100ha)
 * - GET /leads/statistics - Get aggregated statistics
 * - GET /leads/:id - Get a single lead by ID
 * - POST /leads - Create a new lead
 * - PUT /leads/:id - Update an existing lead
 * - DELETE /leads/:id - Delete a lead
 */
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly createLeadService: CreateLeadService,
    private readonly updateLeadService: UpdateLeadService,
    private readonly deleteLeadService: DeleteLeadService,
    private readonly getLeadService: GetLeadService,
    private readonly listLeadsService: ListLeadsService,
    private readonly getPriorityLeadsService: GetPriorityLeadsService,
    private readonly getLeadStatisticsService: GetLeadStatisticsService,
  ) {}

  /**
   * GET /leads
   * List all leads with optional filtering
   * Query parameters: status, municipality, search, highPriorityOnly
   * @returns Array of leads matching the filters
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filters: FilterLeadsDto,
  ): Promise<Lead[]> {
    return this.listLeadsService.execute(filters);
  }

  /**
   * GET /leads/priority
   * Get high-priority leads (those with at least one property > 100 hectares)
   * Must be before /:id route to avoid conflicts
   * @returns Array of high-priority leads
   */
  @Get('priority')
  @HttpCode(HttpStatus.OK)
  async findPriorityLeads(): Promise<Lead[]> {
    return this.getPriorityLeadsService.execute();
  }

  /**
   * GET /leads/statistics
   * Get aggregated statistics about leads
   * @returns Statistics object with counts by status and municipality
   */
  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byMunicipality: Record<string, number>;
  }> {
    const stats = await this.getLeadStatisticsService.execute();
    return {
      total: stats.total,
      byStatus: stats.byStatus,
      byMunicipality: stats.byMunicipality,
    };
  }

  /**
   * GET /leads/:id
   * Get a single lead by ID
   * @param id - Lead UUID
   * @returns Lead entity
   * @throws NotFoundException if lead doesn't exist
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Lead> {
    return this.getLeadService.execute(id);
  }

  /**
   * POST /leads
   * Create a new lead
   * @param createLeadDto - Lead data
   * @returns Created lead entity
   * @throws ConflictException if CPF already exists
   * @throws BadRequestException if validation fails
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.createLeadService.execute(createLeadDto);
  }

  /**
   * PUT /leads/:id
   * Update an existing lead (partial update supported)
   * @param id - Lead UUID
   * @param updateLeadDto - Partial lead data to update
   * @returns Updated lead entity
   * @throws NotFoundException if lead doesn't exist
   * @throws ConflictException if CPF change conflicts with existing lead
   * @throws BadRequestException if status transition is invalid
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateLeadDto: UpdateLeadDto,
  ): Promise<Lead> {
    return this.updateLeadService.execute(id, updateLeadDto);
  }

  /**
   * DELETE /leads/:id
   * Delete a lead by ID
   * @param id - Lead UUID
   * @returns No content (204)
   * @throws NotFoundException if lead doesn't exist
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteLeadService.execute(id);
  }
}
