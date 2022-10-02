import {MigrationInterface, QueryRunner} from "typeorm";
import { Category } from "../entity/Category";

export class AddBasicCategories1610529720090 implements MigrationInterface {
    // Here we add basic categories (like questions, enhancements)
    // VariaMos languages have to be added manually with the UI
    public async up(queryRunner: QueryRunner): Promise<any> {
        const categoryRepo = queryRunner.manager.getRepository(Category);

        await categoryRepo.insert([{
            id: "db1ee3bd-4608-4012-a227-d7ed12e7281d",
            name: "Question"
        }])

        await categoryRepo.insert([{
            id: "fed4493b-b683-414f-85a5-0df2536d357e",
            name: "Enhancement"
        }])

        await categoryRepo.insert([{
            id: "e07f57cb-bd16-4ded-a397-01126c5e3167",
            name: "Bug"
        }])
    }



    public async down(_queryRunner: QueryRunner): Promise<any> {
    }

}