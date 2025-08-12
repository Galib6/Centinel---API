import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheKey } from '@src/app/decorators/cacheKey.decorator';
import { CacheTTL } from '@src/app/decorators/cacheTTL.decorator';
import { CacheInterceptor } from '@src/app/interceptors/cache.interceptor';
import { SuccessResponse } from '@src/app/types';
import { FilterRoleDTO } from '../../acl/dtos';
import { Role } from '../../acl/entities/role.entity';
import { CreateUserDTO, FilterUserDTO, UpdateUserDTO } from '../dtos';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UserController {
  RELATIONS = ['userRoles', 'userRoles.role'];
  constructor(private readonly service: UserService) {}

  @CacheKey('users:user_list')
  @CacheTTL(3600)
  @Get()
  async findAll(@Query() query: FilterUserDTO): Promise<SuccessResponse | User[]> {
    return this.service.findAllBase(query, { relations: this.RELATIONS });
  }

  @Get(':id/available-roles')
  async availableRoles(@Param('id') id: number, @Query() query: FilterRoleDTO): Promise<Role[]> {
    return this.service.availableRoles(id, query);
  }

  @CacheKey('users:user_list_{id}')
  @Get(':id')
  async findById(@Param('id') id: number): Promise<User> {
    return this.service.findByIdBase(id, { relations: this.RELATIONS });
  }

  @Post()
  async createOne(@Body() body: CreateUserDTO): Promise<User> {
    return this.service.createUser(body, this.RELATIONS);
  }

  //   @Post('recover/:id')
  //   async recoverById(@Param('id') id: string): Promise<User> {
  //     return this.service.recoverByIdBase(id);
  //   }

  @Patch(':id')
  async updateOne(@Param('id') id: number, @Body() body: UpdateUserDTO): Promise<User> {
    return this.service.updateUser(id, body, this.RELATIONS);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: number): Promise<SuccessResponse> {
    return this.service.deleteOneBase(id);
  }

  //   @Delete('soft/:id')
  //   async softDeleteOne(@Param('id') id: string): Promise<SuccessResponse> {
  //     return this.service.softDeleteOneBase(id);
  //   }
}
