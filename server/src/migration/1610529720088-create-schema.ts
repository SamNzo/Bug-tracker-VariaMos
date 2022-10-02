import { MigrationInterface, QueryRunner } from 'typeorm';

export class createSchema1610529720088 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "passwordHash" character varying NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "email" character varying(254), "notificationsOn" boolean NOT NULL DEFAULT true, "github" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "notes" ("id" SERIAL NOT NULL, "body" character varying NOT NULL, "authorId" uuid NOT NULL, "bugId" uuid NOT NULL, "gitCommentId" int, "isReply" boolean NOT NULL DEFAULT false, "replyId" SERIAL NOT NULL, "repliesNb" int, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_af6206538ea96c4e77e9f400c3d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "bugs_priority_enum" AS ENUM('low', 'medium', 'high')`
    );
    await queryRunner.query(
      `CREATE TABLE "bugs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying , "priority" "bugs_priority_enum" NOT NULL DEFAULT 'low', "isResolved" boolean NOT NULL DEFAULT false, "closedById" uuid, "closedAt" TIMESTAMP, "reopenedById" uuid, "reopenedAt" TIMESTAMP, "createdById" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedById" uuid, "updatedAt" TIMESTAMP, "ImageFilePath" character varying, "JSONFilePath" character varying, "categoryId" uuid, "gitIssueNumber" int, CONSTRAINT "PK_dadac7f01b703d50496ae1d3e74" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "assignedAdmins" ("id" SERIAL NOT NULL, "bugId" uuid NOT NULL, "adminId" uuid NOT NULL, "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "inviteCodes" ("id" SERIAL NOT NULL, "codeHash" character varying, "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "bugCategories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "joinedAt" TIMESTAMP NOT NULL DEFAULT now(), PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_d358080cb403fe88e62cc9cba58" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_80e0afbc05b34045e45ad183775" FOREIGN KEY ("bugId") REFERENCES "bugs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ADD CONSTRAINT "FK_5748f0f4995f9530bf174a068af" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ADD CONSTRAINT "FK_2e4e579ff84e2e8ee880be824d4" FOREIGN KEY ("reopenedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ADD CONSTRAINT "FK_953bc502117c756d7268995b358" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ADD CONSTRAINT "FK_df9f856721165a7d9e57705fb26" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" ADD CONSTRAINT "FK_df9f856896265a7d9e57705fb26" FOREIGN KEY ("categoryId") REFERENCES "bugCategories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "assignedAdmins" ADD CONSTRAINT "FK_da3e8adedb86281bf9203b1b0ec" FOREIGN KEY ("bugId") REFERENCES "bugs"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "assignedAdmins" ADD CONSTRAINT "FK_b8b1af4785a6d102a8704912178" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bugs" DROP CONSTRAINT "FK_df9f856721165a7d9e57705fb26"`
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" DROP CONSTRAINT "FK_953bc502117c756d7268995b358"`
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" DROP CONSTRAINT "FK_2e4e579ff84e2e8ee880be824d4"`
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" DROP CONSTRAINT "FK_5748f0f4995f9530bf174a068af"`
    );
    await queryRunner.query(
      `ALTER TABLE "bugs" DROP CONSTRAINT "FK_df9f856896265a7d9e57705fb26"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_80e0afbc05b34045e45ad183775"`
    );
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_d358080cb403fe88e62cc9cba58"`
    );
    await queryRunner.query(
      `ALTER TABLE "assignedAdmins" DROP CONSTRAINT "FK_b8b1af4785a6d102a8704912178"`
    );
    await queryRunner.query(
      `ALTER TABLE "assignedAdmins" DROP CONSTRAINT "FK_da3e8adedb86281bf9203b1b0ec"`
    );

    await queryRunner.query(`DROP TABLE "bugs"`);
    await queryRunner.query(`DROP TYPE "bugs_priority_enum"`);
    await queryRunner.query(`DROP TABLE "notes"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "assignedAdmins"`);
    await queryRunner.query(`DROP TABLE "bugCategories"`);
  }
}