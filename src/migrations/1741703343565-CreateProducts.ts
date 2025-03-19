import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProducts1741703343565 implements MigrationInterface {
    name = 'CreateProducts1741703343565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "course_classes" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text, "credits" integer NOT NULL, "instructor" character varying(255), "startDate" date, "endDate" date, "status" character varying(50) NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05ac0244dd8944211770d0cda55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "enrollments" ("id" SERIAL NOT NULL, "studentId" integer NOT NULL, "courseClassId" integer NOT NULL, "enrollmentDate" date NOT NULL, "evaluationNote" integer, "status" character varying(50) NOT NULL DEFAULT 'enrolled', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7c0f752f9fb68bf6ed7367ab00f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "students" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "major" character varying(255), "studentId" character varying(255), "enrollmentDate" date, "graduationYear" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_e0208b4f964e609959aff431bf" UNIQUE ("userId"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_bf3ba3dfa95e2df7388eb4589fd" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_69f467a803fe351d73860b2d144" FOREIGN KEY ("courseClassId") REFERENCES "course_classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_e0208b4f964e609959aff431bf9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_e0208b4f964e609959aff431bf9"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_69f467a803fe351d73860b2d144"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_bf3ba3dfa95e2df7388eb4589fd"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TABLE "enrollments"`);
        await queryRunner.query(`DROP TABLE "course_classes"`);
    }

}
