import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToBillItems1751335000000 implements MigrationInterface {
    name = 'AddUserIdToBillItems1751335000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar la columna userId como UUID sin foreign key constraint
        // ya que la tabla users está en otra base de datos
        await queryRunner.query(`ALTER TABLE "bill_items" ADD "userId" uuid NOT NULL`);
        
        // Crear un índice para mejorar el rendimiento de las consultas
        await queryRunner.query(`CREATE INDEX "IDX_bill_items_user_id" ON "bill_items" ("userId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar el índice
        await queryRunner.query(`DROP INDEX "IDX_bill_items_user_id"`);
        
        // Eliminar la columna userId
        await queryRunner.query(`ALTER TABLE "bill_items" DROP COLUMN "userId"`);
    }
} 