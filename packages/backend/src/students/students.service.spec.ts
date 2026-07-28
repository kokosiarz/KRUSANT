import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StudentsService } from './students.service';
import { Student } from './student.entity';
import { Payment } from '../payments/payment.entity';
import { Debit } from '../debits/debit.entity';
import { Group } from '../groups/group.entity';
import { ClassEntity } from '../classes/class.entity';

describe('StudentsService', () => {
  let service: StudentsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Student, Payment, Debit, Group, ClassEntity],
          synchronize: true,
          retryAttempts: 0,
        }),
        TypeOrmModule.forFeature([Student]),
      ],
      providers: [StudentsService],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllWithBalance', () => {
    it('computes balance from payments minus debits', async () => {
      const student = await service.create({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        semester: 'I',
      });

      await dataSource.getRepository(Payment).save({
        studentId: student.id,
        date: '2026-01-01',
        amount: 300,
        proofType: 'receipt',
      });
      await dataSource
        .getRepository(Debit)
        .save({ studentId: student.id, dueDate: '2026-01-01', amount: 100 });

      const [result] = await service.findAllWithBalance();

      expect(result.balance).toBe(200);
    });

    it('estimates lessonsLeft from the active group rate, applying the student discount', async () => {
      const student = await service.create({
        name: 'Grace Hopper',
        email: 'grace@example.com',
        semester: 'I',
        discount: 10,
      });

      await dataSource.getRepository(Group).save({
        name: 'Test Group',
        isActive: true,
        studentIds: [student.id],
        classIds: [],
        teacherId: 1,
        cost: 1000,
        unitCost: 100,
      });
      await dataSource.getRepository(Payment).save({
        studentId: student.id,
        date: '2026-01-01',
        amount: 900,
        proofType: 'receipt',
      });

      const [result] = await service.findAllWithBalance();

      // unitCost 100 with a 10% discount -> 90/lesson; balance 900 -> 10 lessons
      expect(result.unitCost).toBeCloseTo(90);
      expect(result.lessonsLeft).toBe(10);
    });

    it('returns null lessonsLeft when the student has no active group and no custom rate', async () => {
      const student = await service.create({
        name: 'No Group Student',
        email: 'nogroup@example.com',
        semester: 'I',
      });
      await dataSource.getRepository(Payment).save({
        studentId: student.id,
        date: '2026-01-01',
        amount: 500,
        proofType: 'receipt',
      });

      const [result] = await service.findAllWithBalance();

      expect(result.unitCost).toBeNull();
      expect(result.lessonsLeft).toBeNull();
    });
  });
});
