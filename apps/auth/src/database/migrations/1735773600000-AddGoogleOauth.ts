import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleOauth1735773600000 implements MigrationInterface {
    name = 'AddGoogleOauth1735773600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "googleId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "provider" character varying NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
    }
}
