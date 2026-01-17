import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  email: string;
  //   payment: number;

  @AfterInsert()
  logInsert() {
    console.log('Inserted teacher with id', this.id);
  }

  @AfterUpdate()
  logUpdate() {
    console.log('Updated teacher with id', this.id);
  }
  @AfterRemove()
  logRemove() {
    console.log('Removed teacher with id', this.id);
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
