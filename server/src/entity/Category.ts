import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Bug } from './Bug';

@Entity({ name: 'bugCategories' })
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column()
    name: string;

    @OneToMany(() => Bug, bug => bug.category)
    bugs: Bug[];
}
