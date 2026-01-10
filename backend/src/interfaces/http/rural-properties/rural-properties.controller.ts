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
import { CreateRuralPropertyDto } from './dto/create-rural-property.dto';
import { UpdateRuralPropertyDto } from './dto/update-rural-property.dto';
import { FilterRuralPropertiesDto } from './dto/filter-rural-properties.dto';
import { CreateRuralPropertyService } from '@application/use-cases/rural-properties/create-rural-property.service';
import { UpdateRuralPropertyService } from '@application/use-cases/rural-properties/update-rural-property.service';
import { DeleteRuralPropertyService } from '@application/use-cases/rural-properties/delete-rural-property.service';
import { GetRuralPropertyService } from '@application/use-cases/rural-properties/get-rural-property.service';
import { ListRuralPropertiesService } from '@application/use-cases/rural-properties/list-rural-properties.service';
import { GetRuralPropertyStatisticsService } from '@application/use-cases/rural-properties/get-rural-property-statistics.service';
import { RuralProperty } from '@domain/rural-properties/rural-property.entity';

/**
 * REST Controller for Rural Property management
 * Handles all HTTP requests related to rural properties
 *
 * Routes:
 * - GET /rural-properties - List all properties with optional filters
 * - GET /rural-properties/statistics - Get aggregated statistics
 * - GET /rural-properties/:id - Get a single property by ID
 * - POST /rural-properties - Create a new property
 * - PUT /rural-properties/:id - Update an existing property
 * - DELETE /rural-properties/:id - Delete a property
 */
@Controller('rural-properties')
export class RuralPropertiesController {
  constructor(
    private readonly createRuralPropertyService: CreateRuralPropertyService,
    private readonly updateRuralPropertyService: UpdateRuralPropertyService,
    private readonly deleteRuralPropertyService: DeleteRuralPropertyService,
    private readonly getRuralPropertyService: GetRuralPropertyService,
    private readonly listRuralPropertiesService: ListRuralPropertiesService,
    private readonly getRuralPropertyStatisticsService: GetRuralPropertyStatisticsService,
  ) {}

  /**
   * GET /rural-properties
   * List all rural properties with optional filtering
   * Query parameters: leadId, cropType, minArea, maxArea, highPriorityOnly
   * @returns Array of properties matching the filters
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filters: FilterRuralPropertiesDto,
  ): Promise<RuralProperty[]> {
    return this.listRuralPropertiesService.execute(filters);
  }

  /**
   * GET /rural-properties/statistics
   * Get aggregated statistics about rural properties
   * @returns Statistics object with counts by crop type, total area, etc.
   */
  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  async getStatistics(): Promise<{
    total: number;
    totalArea: number;
    averageArea: number;
    byCropType: Record<string, number>;
    highPriorityCount: number;
  }> {
    return this.getRuralPropertyStatisticsService.execute();
  }

  /**
   * GET /rural-properties/:id
   * Get a single rural property by ID
   * @param id - Property UUID
   * @returns RuralProperty entity
   * @throws NotFoundException if property doesn't exist
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RuralProperty> {
    return this.getRuralPropertyService.execute(id);
  }

  /**
   * POST /rural-properties
   * Create a new rural property
   * @param createDto - Property data
   * @returns Created property entity
   * @throws NotFoundException if lead doesn't exist
   * @throws BadRequestException if validation fails
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createDto: CreateRuralPropertyDto): Promise<RuralProperty> {
    return this.createRuralPropertyService.execute(createDto);
  }

  /**
   * PUT /rural-properties/:id
   * Update an existing rural property (partial update supported)
   * @param id - Property UUID
   * @param updateDto - Partial property data to update
   * @returns Updated property entity
   * @throws NotFoundException if property or new lead doesn't exist
   * @throws BadRequestException if validation fails
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateRuralPropertyDto,
  ): Promise<RuralProperty> {
    return this.updateRuralPropertyService.execute(id, updateDto);
  }

  /**
   * DELETE /rural-properties/:id
   * Delete a rural property by ID
   * @param id - Property UUID
   * @returns No content (204)
   * @throws NotFoundException if property doesn't exist
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteRuralPropertyService.execute(id);
  }
}
