import { DataSource } from 'typeorm';
import { Group } from './groups/group.entity';
import { Student } from './students/student.entity';
import { Debit } from './debits/debit.entity';
import { Payment } from './payments/payment.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite', // change to your db type if needed
  database: '../db.sqlite', // adjust path if needed
  entities: [Group, Student, Debit, Payment], // add all your entities here
  migrations: ['src/migrations/*.ts'],
  synchronize: true, // TODO set to false in production
});

export default AppDataSource;
