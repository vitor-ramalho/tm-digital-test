import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1767881407941 implements MigrationInterface {
  name = 'InitialSchema1767881407941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."leads_status_enum" AS ENUM('NEW', 'INITIAL_CONTACT', 'NEGOTIATION', 'CONVERTED', 'LOST')`,
    );
    await queryRunner.query(
      `CREATE TABLE "leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "cpf" character varying(11) NOT NULL, "status" "public"."leads_status_enum" NOT NULL DEFAULT 'NEW', "comments" text, "municipality" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_14ee3f571bb43425136b0e4052" ON "leads" ("name") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_566c24505f913062e1026bff97" ON "leads" ("cpf") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8e456b86cd5fbfb9edf8daeb51" ON "leads" ("status", "municipality") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."rural_properties_crop_type_enum" AS ENUM('SOY', 'CORN', 'COTTON')`,
    );
    await queryRunner.query(
      `CREATE TABLE "rural_properties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lead_id" uuid NOT NULL, "crop_type" "public"."rural_properties_crop_type_enum" NOT NULL, "area_hectares" numeric(10,2) NOT NULL, "geometry" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_056944d83040eaf2c1c4921eeec" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ccaa2ac83a36f2bd0973a96f6" ON "rural_properties" ("lead_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4d4f60dcc6a9b64bf32a618949" ON "rural_properties" ("area_hectares") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f981a1c5c10ba25a9d5d4ac7cf" ON "rural_properties" ("lead_id", "crop_type") `,
    );
    await queryRunner.query(
      `ALTER TABLE "rural_properties" ADD CONSTRAINT "FK_1ccaa2ac83a36f2bd0973a96f6b" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rural_properties" DROP CONSTRAINT "FK_1ccaa2ac83a36f2bd0973a96f6b"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_f981a1c5c10ba25a9d5d4ac7cf"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4d4f60dcc6a9b64bf32a618949"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1ccaa2ac83a36f2bd0973a96f6"`);
    await queryRunner.query(`DROP TABLE "rural_properties"`);
    await queryRunner.query(`DROP TYPE "public"."rural_properties_crop_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8e456b86cd5fbfb9edf8daeb51"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_566c24505f913062e1026bff97"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_14ee3f571bb43425136b0e4052"`);
    await queryRunner.query(`DROP TABLE "leads"`);
    await queryRunner.query(`DROP TYPE "public"."leads_status_enum"`);
  }
}
