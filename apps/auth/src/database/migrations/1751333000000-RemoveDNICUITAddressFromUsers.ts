import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDNICUITAddressFromUsers1751333000000 implements MigrationInterface {
    name = 'RemoveDNICUITAddressFromUsers1751333000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar las constraints únicas primero
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_797d2e4daebc358d3223b75863c"`);
        
        // Eliminar las columnas
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dni"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cuit"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recrear las columnas
        await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "cuit" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "dni" character varying(20)`);
        
        // Recrear las constraints únicas
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_797d2e4daebc358d3223b75863c" UNIQUE ("cuit")`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_5fe9cfa518b76c96518a206b350" UNIQUE ("dni")`);
    }
} 