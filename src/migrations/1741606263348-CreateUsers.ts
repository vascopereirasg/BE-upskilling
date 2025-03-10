import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1741606263348 implements MigrationInterface {
    name = 'CreateUsers1741606263348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "credentials" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "password" character varying(255) NOT NULL, CONSTRAINT "REL_8d3a07b8e994962efe57ebd0f2" UNIQUE ("userId"), CONSTRAINT "PK_1e38bc43be6697cdda548ad27a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "credentials" ADD CONSTRAINT "FK_8d3a07b8e994962efe57ebd0f20" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credentials" DROP CONSTRAINT "FK_8d3a07b8e994962efe57ebd0f20"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE "credentials"`);
    }

}
