import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBillItemsToUsers1751334000000 implements MigrationInterface {
    name = 'AddBillItemsToUsers1751334000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "billItems" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "billItems"`);
    }
} 