import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBillItemsTable1751334000000 implements MigrationInterface {
    name = 'CreateBillItemsTable1751334000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bill_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cuit" character varying(20) NOT NULL, "afipPassword" character varying NOT NULL, "name" character varying NOT NULL, "realPerson" boolean NOT NULL DEFAULT true, "address" character varying, "phone" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_bill_items_cuit" UNIQUE ("cuit"), CONSTRAINT "PK_bill_items_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bill_items"`);
    }
} 