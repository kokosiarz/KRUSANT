import { DataSource } from 'typeorm';
import { Student } from '../students/student.entity';
import { Payment } from '../payments/payment.entity';

export async function migratePaymentsToEntity(dataSource: DataSource) {
  const studentRepo = dataSource.getRepository(Student);
  const paymentRepo = dataSource.getRepository(Payment);
  const students = await studentRepo.find();

  for (const student of students) {
    // @ts-ignore: payments may still exist in DB
    const payments = (student as any).payments || [];
    for (const p of payments) {
      const payment = paymentRepo.create({
        date: p.date,
        amount: p.amount,
        comment: p.comment,
        studentId: student.id,
      });
      await paymentRepo.save(payment);
    }
  }
  console.log('Payments migrated to Payment entity.');
}

// Usage example (run in a script):
// import { AppDataSource } from '../data-source';
// AppDataSource.initialize().then(() => migratePaymentsToEntity(AppDataSource));
