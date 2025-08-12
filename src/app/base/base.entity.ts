import { ENUM_COLUMN_TYPES } from "@src/shared";
import { Type } from "class-transformer";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../modules/user/entities/user.entity";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("increment", { type: ENUM_COLUMN_TYPES.INT })
  id?: number;

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

  @RelationId((e: BaseEntity) => e.createdBy)
  createdById?: number;

  @ManyToOne(() => User, { onDelete: "NO ACTION" })
  @Type(() => User)
  updatedBy?: User;

  @RelationId((e: BaseEntity) => e.updatedBy)
  updatedById?: number;
}
