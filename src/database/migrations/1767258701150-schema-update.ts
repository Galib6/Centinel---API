import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchemaUpdate1767258701150 implements MigrationInterface {
  name = 'SchemaUpdate1767258701150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_cec119ce18936c7b6c24142be3e"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_5de46381983d514c100aaceb542"`);
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "createdById" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "updatedById" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`
    );
    await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "roleId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "userId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_51d635f1d983d505fb5a2f44c52"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_52e97c477859f8019f3705abd21"`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "createdById" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updatedById" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "file_storages" DROP CONSTRAINT "FK_ff768cac9286a816365d362c008"`
    );
    await queryRunner.query(
      `ALTER TABLE "file_storages" DROP CONSTRAINT "FK_f24c5f66163fa19895cc77f79da"`
    );
    await queryRunner.query(`ALTER TABLE "file_storages" ALTER COLUMN "createdById" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "file_storages" ALTER COLUMN "updatedById" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "permission_types" DROP CONSTRAINT "FK_c5a53b0dec56384fb565b874fff"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" DROP CONSTRAINT "FK_ffc419a7b4f4eb9f2a83cd12c5d"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" ALTER COLUMN "createdById" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" ALTER COLUMN "updatedById" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_9c62bef7488ad2f934e0a52a1ed"`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_3ec888a96330ca53ded73988c92"`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_2654e4ea4199133ea4ad592b7a8"`
    );
    await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "createdById" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "updatedById" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "permissionTypeId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_e57d242f2e93a522a00fb9be970"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_a8ecd7142bbeea2cd67c942c6ef"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ALTER COLUMN "createdById" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ALTER COLUMN "updatedById" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "role_permissions" ALTER COLUMN "roleId" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ALTER COLUMN "permissionId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "auth_stats" DROP CONSTRAINT "FK_1379a375c2a84b413b89c996d07"`
    );
    await queryRunner.query(
      `ALTER TABLE "auth_stats" DROP CONSTRAINT "FK_ffac65e747706bbbe3e30df645a"`
    );
    await queryRunner.query(`ALTER TABLE "auth_stats" ALTER COLUMN "createdById" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "auth_stats" ALTER COLUMN "updatedById" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_cec119ce18936c7b6c24142be3e" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_5de46381983d514c100aaceb542" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_51d635f1d983d505fb5a2f44c52" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_52e97c477859f8019f3705abd21" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "file_storages" ADD CONSTRAINT "FK_ff768cac9286a816365d362c008" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "file_storages" ADD CONSTRAINT "FK_f24c5f66163fa19895cc77f79da" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" ADD CONSTRAINT "FK_c5a53b0dec56384fb565b874fff" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" ADD CONSTRAINT "FK_ffc419a7b4f4eb9f2a83cd12c5d" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_9c62bef7488ad2f934e0a52a1ed" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_3ec888a96330ca53ded73988c92" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_2654e4ea4199133ea4ad592b7a8" FOREIGN KEY ("permissionTypeId") REFERENCES "permission_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_e57d242f2e93a522a00fb9be970" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_a8ecd7142bbeea2cd67c942c6ef" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "auth_stats" ADD CONSTRAINT "FK_1379a375c2a84b413b89c996d07" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "auth_stats" ADD CONSTRAINT "FK_ffac65e747706bbbe3e30df645a" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth_stats" DROP CONSTRAINT "FK_ffac65e747706bbbe3e30df645a"`
    );
    await queryRunner.query(
      `ALTER TABLE "auth_stats" DROP CONSTRAINT "FK_1379a375c2a84b413b89c996d07"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_a8ecd7142bbeea2cd67c942c6ef"`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_e57d242f2e93a522a00fb9be970"`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_2654e4ea4199133ea4ad592b7a8"`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_3ec888a96330ca53ded73988c92"`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "FK_9c62bef7488ad2f934e0a52a1ed"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" DROP CONSTRAINT "FK_ffc419a7b4f4eb9f2a83cd12c5d"`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" DROP CONSTRAINT "FK_c5a53b0dec56384fb565b874fff"`
    );
    await queryRunner.query(
      `ALTER TABLE "file_storages" DROP CONSTRAINT "FK_f24c5f66163fa19895cc77f79da"`
    );
    await queryRunner.query(
      `ALTER TABLE "file_storages" DROP CONSTRAINT "FK_ff768cac9286a816365d362c008"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_52e97c477859f8019f3705abd21"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_51d635f1d983d505fb5a2f44c52"`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_5de46381983d514c100aaceb542"`);
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_cec119ce18936c7b6c24142be3e"`);
    await queryRunner.query(`ALTER TABLE "auth_stats" ALTER COLUMN "updatedById" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "auth_stats" ALTER COLUMN "createdById" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "auth_stats" ADD CONSTRAINT "FK_ffac65e747706bbbe3e30df645a" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "auth_stats" ADD CONSTRAINT "FK_1379a375c2a84b413b89c996d07" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ALTER COLUMN "permissionId" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "role_permissions" ALTER COLUMN "roleId" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ALTER COLUMN "updatedById" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ALTER COLUMN "createdById" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_a8ecd7142bbeea2cd67c942c6ef" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_e57d242f2e93a522a00fb9be970" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "permissionTypeId" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "updatedById" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "createdById" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_2654e4ea4199133ea4ad592b7a8" FOREIGN KEY ("permissionTypeId") REFERENCES "permission_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_3ec888a96330ca53ded73988c92" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "FK_9c62bef7488ad2f934e0a52a1ed" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" ALTER COLUMN "updatedById" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" ALTER COLUMN "createdById" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" ADD CONSTRAINT "FK_ffc419a7b4f4eb9f2a83cd12c5d" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "permission_types" ADD CONSTRAINT "FK_c5a53b0dec56384fb565b874fff" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`ALTER TABLE "file_storages" ALTER COLUMN "updatedById" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "file_storages" ALTER COLUMN "createdById" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "file_storages" ADD CONSTRAINT "FK_f24c5f66163fa19895cc77f79da" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "file_storages" ADD CONSTRAINT "FK_ff768cac9286a816365d362c008" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "updatedById" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "createdById" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_52e97c477859f8019f3705abd21" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_51d635f1d983d505fb5a2f44c52" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "userId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_roles" ALTER COLUMN "roleId" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "updatedById" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "createdById" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_5de46381983d514c100aaceb542" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_cec119ce18936c7b6c24142be3e" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
