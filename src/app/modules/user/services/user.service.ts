import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { BcryptHelper } from '@src/app/helpers';
import { asyncForEach, ENUM_ACL_DEFAULT_ROLES } from '@src/shared';
import { plainToInstance } from 'class-transformer';
import { isNotEmptyObject } from 'class-validator';
import { DataSource, Repository } from 'typeorm';
import { FilterRoleDTO } from '../../acl/dtos';
import { Role } from '../../acl/entities/role.entity';
import { RoleService } from '../../acl/services/role.service';
import { LoginDTO, RegisterDTO } from '../../auth/dtos';
import { CreateRolesDTO, CreateUserDTO, UpdateRolesDTO, UpdateUserDTO } from '../dtos';
import { User } from '../entities/user.entity';
import { UserRole } from './../entities/userRole.entity';
import { UserRoleService } from './userRole.service';

@Injectable()
export class UserService extends BaseService<User> {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userRoleService: UserRoleService,
    private readonly roleService: RoleService,
    private readonly bcrypt: BcryptHelper,
    private readonly dataSource: DataSource
  ) {
    super(userRepository);
  }

  async availableRoles(id: string, payload: FilterRoleDTO): Promise<any> {
    const isExist = await this.isExist({ id });

    const roles = (await this.roleService.findAllBase(payload, {
      withoutPaginate: true,
    })) as Role[];

    const userRoles = await this.userRoleService.find({
      where: {
        user: { id: isExist.id as any },
      },
    });

    if (roles && roles.length > 0) {
      roles.forEach((role) => {
        const isAlreadyAdded = userRoles.find((userRole) => userRole.roleId === role.id);
        role.isAlreadyAdded = !!isAlreadyAdded;
      });
    }

    return roles;
  }

  async createUser(payload: CreateUserDTO, relations?: string[]): Promise<User> {
    const { roles, ...userData } = payload;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let createdUser = null;

    try {
      createdUser = await queryRunner.manager.save(Object.assign(new User(), userData));

      if (!createdUser) {
        throw new BadRequestException('User not created');
      }

      if (roles && roles.length) {
        await asyncForEach(roles, async (role: CreateRolesDTO) => {
          await this.roleService.isExist({ id: role.role });
          await queryRunner.manager.save(
            Object.assign(new UserRole(), {
              user: createdUser.id,
              role: role.role,
            })
          );
        });
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new Error(error);
    }

    if (!createdUser) {
      throw new BadRequestException('User not created');
    }

    const updatedUser = await this.findOne({
      where: {
        id: createdUser.id,
      },
      relations,
    });

    return updatedUser;
  }

  async updateUser(id: string, payload: UpdateUserDTO, relations: string[]): Promise<User> {
    await this.isExist({ id });

    const { roleIds, ...userData } = payload;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (isNotEmptyObject(userData)) {
        await queryRunner.manager.update(User, { id }, userData);
      }

      if (roleIds && roleIds.length > 0) {
        const deletedItems = roleIds.filter((role) => role.isDeleted);
        const newOrUpdatedItems = roleIds.filter((role) => !role.isDeleted);

        await asyncForEach(deletedItems, async (role: UpdateRolesDTO) => {
          await this.userRoleService.isExist({
            userId: id,
            roleId: role.id,
          });
          await queryRunner.manager.delete(UserRole, {
            userId: id,
            roleId: role.id,
          });
        });

        await asyncForEach(newOrUpdatedItems, async (role: UpdateRolesDTO) => {
          await this.roleService.isExist({
            id: role.id,
          });
          const isUserRoleExist = await this.userRoleService.findOne({
            where: {
              userId: id,
              roleId: role.id,
            },
          });
          if (!isUserRoleExist) {
            await queryRunner.manager.save(
              plainToInstance(UserRole, {
                userId: id,
                roleId: role.id,
              })
            );
          }
        });
      }

      await queryRunner.commitTransaction();
      await queryRunner.release();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new BadRequestException(error.message || 'User not updated');
    }

    const updatedUser = await this.findOne({
      where: {
        id: id,
      },
      relations,
    });

    return updatedUser;
  }

  async findOrCreateByPhoneNumber(phoneNumber: string): Promise<User> {
    const role = await this.roleService.findOneBase({
      title: ENUM_ACL_DEFAULT_ROLES.CUSTOMER,
    });
    const isExist = await this.findOneBase({ phoneNumber });

    if (isExist) {
      return isExist;
    } else {
      const user = await this.createOneBase({
        phoneNumber,
      });

      await this.userRoleService.createOneBase({
        user: user.id as any,
        role: role.id as any,
      });
      return user;
    }
  }

  async registerUser(payload: RegisterDTO): Promise<User> {
    // const role = await this.roleService.findOneBase({
    //   title: ENUM_ACL_DEFAULT_ROLES.SUPER_ADMIN,
    // });
    const isExist = await this.findOneBase({ email: payload.email });

    if (isExist) {
      throw new ConflictException('Email already exists');
    } else {
      const createdUser = await this.createOneBase({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        password: payload.password,
        phoneNumber: payload?.phoneNumber,
        isVerified: true,
      });

      // const userRole = await this.userRoleService.createOneBase({
      //   user: createdUser.id as any,
      //   role: role.id as any,
      // });
      return createdUser;
    }
  }

  async loginUser(payload: LoginDTO): Promise<User> {
    const isExist = await this.findOne({
      where: { email: payload.email },
      select: ['id', 'firstName', 'lastName', 'email', 'password', 'phoneNumber'],
    });

    if (!isExist) {
      throw new BadRequestException('User does not exists');
    }

    const isPasswordMatch = await this.bcrypt.compareHash(payload.password, isExist.password);

    if (!isPasswordMatch) {
      throw new BadRequestException('Password does not match');
    }

    return isExist;
  }
}
