import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { RoleValue } from './role.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: RoleValue,
    unique: true,
  })
  name: RoleValue;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
