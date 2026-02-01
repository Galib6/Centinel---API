import { BaseEntity } from '@src/app/base';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Permission } from './permission.entity';
import { Role } from './role.entity';

@Entity(ENUM_TABLE_NAMES.ROLE_PERMISSIONS, { orderBy: { createdAt: 'DESC' } })
export class RolePermission extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @Type(() => Role)
  role?: Role;

  @Column({ type: ENUM_COLUMN_TYPES.UUID, nullable: true })
  @RelationId((e: RolePermission) => e.role)
  roleId?: string;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @Type(() => Permission)
  permission?: Permission;

  @Column({ type: ENUM_COLUMN_TYPES.UUID, nullable: true })
  @RelationId((e: RolePermission) => e.permission)
  permissionId?: string;
}
