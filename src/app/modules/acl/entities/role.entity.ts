import { ENUM_COLUMN_TYPES, ENUM_TABLE_NAMES } from "@src/shared";
import { Type } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity(ENUM_TABLE_NAMES.ROLES, { orderBy: { createdAt: "DESC" } })
export class Role {
  public static readonly SEARCH_TERMS: string[] = ["title"];

  @PrimaryGeneratedColumn("increment", { type: ENUM_COLUMN_TYPES.INT })
  id?: number;

  @Column()
  title?: string;

  isAlreadyAdded?: boolean = false;

  @Column({ type: ENUM_COLUMN_TYPES.BOOLEAN, default: true, nullable: true })
  isActive?: boolean;

  @CreateDateColumn({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC })
  createdAt?: Date;

  @UpdateDateColumn({ type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC })
  updatedAt?: Date;

  @DeleteDateColumn({ select: false, type: ENUM_COLUMN_TYPES.TIMESTAMP_UTC })
  deletedAt?: Date;

  @ManyToOne(() => User, { onDelete: "NO ACTION" })
  @Type(() => User)
  createdBy?: User;

  @RelationId((e: Role) => e.createdBy)
  createdById?: number;

  @ManyToOne(() => User, { onDelete: "NO ACTION" })
  @Type(() => User)
  updatedBy?: User;

  @RelationId((e: Role) => e.updatedBy)
  updatedById?: number;
}
