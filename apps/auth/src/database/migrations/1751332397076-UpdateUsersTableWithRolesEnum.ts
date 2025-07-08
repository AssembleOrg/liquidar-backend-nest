import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersTableWithRolesEnum1751332397076 implements MigrationInterface {
    name = 'UpdateUsersTableWithRolesEnum1751332397076'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "lastSendVerificationEmail" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('USER', 'PAYEDUSER', 'ADMIN', 'SUPERADMIN')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{USER}'`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_797d2e4daebc358d3223b75863c" UNIQUE ("cuit")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350" UNIQUE ("dni")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_797d2e4daebc358d3223b75863c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
        await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" text NOT NULL DEFAULT '["user"]'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastSendVerificationEmail"`);
    }
} 