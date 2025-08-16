import { MigrationInterface, QueryRunner } from 'typeorm';

export class New1753727011784 implements MigrationInterface {
  name = 'New1753727011784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_cec119ce18936c7b6c24142be3e"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_5de46381983d514c100aaceb542"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "createdById"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "updatedById"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" ADD "updatedById" integer`);
    await queryRunner.query(`ALTER TABLE "roles" ADD "createdById" integer`);
    await queryRunner.query(`ALTER TABLE "roles" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "roles" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "roles" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "roles" ADD "isActive" boolean DEFAULT true`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_5de46381983d514c100aaceb542" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_cec119ce18936c7b6c24142be3e" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
