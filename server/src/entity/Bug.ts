import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Entity,
  BaseEntity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Note } from './Note';
import { AssignedAdmins } from './AssignedAdmins';
import { Category } from './Category';

type Priority = 'low' | 'medium' | 'high';

@Entity({ name: 'bugs' })
export class Bug extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 60 })
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'low',
  })
  priority: Priority;

  @OneToMany(() => Note, (note) => note.bug)
  @JoinColumn()
  notes: Note[];

  @Column({ default: false })
  isResolved: boolean;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'closedById' })
  closedBy: User;
  @Column({ type: 'text', nullable: true })
  closedById: string | null;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'reopenedById' })
  reopenedBy: User;
  @Column({ type: 'text', nullable: true })
  reopenedById: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reopenedAt: Date | null;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;
  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;
  @Column({ nullable: true })
  updatedById: string;

  @Column({ nullable: true })
  updatedAt: Date;

  @OneToMany(() => AssignedAdmins, (assignment) => assignment.bug)
  @JoinColumn()
  assignments: AssignedAdmins[];

  @Column()
  ImageFilePath: string;

  @Column()
  JSONFilePath: string;

  @ManyToOne(() => Category, (category) => category)
  @JoinColumn({ name: "categoryId" })
  category: Category;
  @Column()
  categoryId: string;

  @Column()
  gitIssueNumber: number;
}
