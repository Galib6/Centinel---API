import { Role } from '@src/app/modules/acl/entities/role.entity';
import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from '@src/shared';
import { Type } from 'class-transformer';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { User } from './user.entity';

@Entity(ENUM_TABLE_NAMES.USER_ROLES)
export class UserRole {
  public static readonly SEARCH_TERMS: string[] = [];

  @PrimaryGeneratedColumn('increment', { type: ENUM_COLUMN_TYPES.INT })
  id?: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @Type(() => Role)
  role?: Role;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Type(() => User)
  user?: User;

  @Column({ type: ENUM_COLUMN_TYPES.UUID })
  @RelationId((e: UserRole) => e.role)
  roleId?: string;

  @Column({ type: ENUM_COLUMN_TYPES.UUID })
  @RelationId((e: UserRole) => e.user)
  userId?: string;
}
