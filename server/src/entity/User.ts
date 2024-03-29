import { Entity, Column } from 'typeorm';
import BaseModel from './BaseModel';

@Entity({ name: 'users' })
export class User extends BaseModel {
  @Column({ type: 'varchar', length: 20 })
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  isAdmin: boolean;

  @Column()
  email: string;

  @Column()
  notificationsOn: boolean;

  @Column()
  github: string;
  
}
