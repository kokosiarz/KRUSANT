import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { StudentsService } from './students.service';
import { Student } from './student.entity';
import { Payment } from '../payments/payment.entity';
import { Debit } from '../debits/debit.entity';
import { Group } from '../groups/group.entity';
import { ClassEntity } from '../classes/class.entity';
import {
  ClassAttendance,
  AttendanceStatus,
} from '../classes/class-attendance.entity';

describe('StudentsService', () => {
  let service: StudentsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [
            Student,
            Payment,
            Debit,
            Group,
            ClassEntity,
            ClassAttendance,
          ],
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

    it('estimates lessonsLeft from the active group rate for a 1-hour lesson, applying the student discount', async () => {
      const student = await service.create({
        name: 'Grace Hopper',
        email: 'grace@example.com',
        semester: 'I',
        discount: 10,
      });

      const group = await dataSource.getRepository(Group).save({
        name: 'Test Group',
        isActive: true,
        teacherId: 1,
        cost: 1000,
        unitCost: 100, // per hour
        lessonLength: '01:00',
      });
      await dataSource
        .createQueryBuilder()
        .relation(Group, 'students')
        .of(group)
        .add(student.id);
      await dataSource.getRepository(Payment).save({
        studentId: student.id,
        date: '2026-01-01',
        amount: 900,
        proofType: 'receipt',
      });

      const [result] = await service.findAllWithBalance();

      // 1-hour lesson at 100/hour with a 10% discount -> 90/lesson; balance 900 -> 10 lessons
      expect(result.unitCost).toBeCloseTo(90);
      expect(result.lessonsLeft).toBe(10);
    });

    it('converts the hourly rate to a per-lesson cost for multi-hour lessons (regression: previously divided balance by the raw hourly rate)', async () => {
      const student = await service.create({
        name: 'Katherine Johnson',
        email: 'katherine@example.com',
        semester: 'I',
      });

      const group = await dataSource.getRepository(Group).save({
        name: 'Intensive Group',
        isActive: true,
        teacherId: 1,
        cost: 5000,
        unitCost: 100, // per hour
        lessonLength: '05:00', // 5-hour sessions, matching real course groups
      });
      await dataSource
        .createQueryBuilder()
        .relation(Group, 'students')
        .of(group)
        .add(student.id);
      await dataSource.getRepository(Payment).save({
        studentId: student.id,
        date: '2026-01-01',
        amount: 1000,
        proofType: 'receipt',
      });

      const [result] = await service.findAllWithBalance();

      // A single 5-hour lesson costs 5 * 100 = 500, not 100 — balance 1000 covers 2 lessons.
      expect(result.unitCost).toBe(500);
      expect(result.lessonsLeft).toBe(2);
    });

    it('returns null lessonsLeft when the active group has no lessonLength set (cannot determine a per-lesson cost)', async () => {
      const student = await service.create({
        name: 'No Lesson Length',
        email: 'nolessonlength@example.com',
        semester: 'I',
      });

      const group = await dataSource.getRepository(Group).save({
        name: 'Group Without Lesson Length',
        isActive: true,
        teacherId: 1,
        cost: 1000,
        unitCost: 100,
      });
      await dataSource
        .createQueryBuilder()
        .relation(Group, 'students')
        .of(group)
        .add(student.id);

      const [result] = await service.findAllWithBalance();

      expect(result.unitCost).toBeNull();
      expect(result.lessonsLeft).toBeNull();
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

  describe('funds run-out forecast', () => {
    const future = (days: number) =>
      new Date(Date.now() + days * 86_400_000).toISOString();

    /** Student in one active group, with `count` upcoming classes at `cost`. */
    async function seed(opts: {
      balance: number;
      discount?: number;
      cost: number;
      count: number;
      startingInDays?: number;
    }) {
      const student = await service.create({
        name: 'Forecast Student',
        email: `forecast${Math.random()}@example.com`,
        semester: 'I',
        discount: opts.discount,
      });
      const group = await dataSource.getRepository(Group).save({
        name: `Group ${Math.random()}`,
        isActive: true,
        teacherId: 1,
        cost: 1000,
        unitCost: 100,
        lessonLength: '01:00',
      });
      await dataSource
        .createQueryBuilder()
        .relation(Group, 'students')
        .of(group)
        .add(student.id);
      await dataSource.getRepository(Payment).save({
        studentId: student.id,
        date: '2026-01-01',
        amount: opts.balance,
        proofType: 'receipt',
      });
      const starts: string[] = [];
      for (let i = 0; i < opts.count; i++) {
        const startTime = future((opts.startingInDays ?? 1) + i * 7);
        starts.push(startTime);
        // Linked by class.groupId, the only link between a class and a group.
        await dataSource.getRepository(ClassEntity).save({
          groupId: group.id,
          startTime,
          lessonLength: '01:00',
          cost: opts.cost,
        });
      }
      return { student, starts };
    }

    it('flags the first scheduled class the balance cannot cover', async () => {
      const { starts } = await seed({ balance: 250, cost: 100, count: 5 });

      const [result] = await service.findAllWithBalance();

      // 250 covers two 100 classes; the third is where it runs out.
      expect(result.scheduledLessonsCovered).toBe(2);
      expect(result.fundsRunOutDate).toBe(starts[2]);
      expect(result.scheduledLessonsAhead).toBe(5);
    });

    it('applies the student discount, which stretches the balance further', async () => {
      const { starts } = await seed({
        balance: 250,
        discount: 50,
        cost: 100,
        count: 6,
      });

      const [result] = await service.findAllWithBalance();

      // At 50 per class the same 250 now covers five, not two.
      expect(result.scheduledLessonsCovered).toBe(5);
      expect(result.fundsRunOutDate).toBe(starts[5]);
    });

    it('returns no run-out date when the balance covers every scheduled class', async () => {
      await seed({ balance: 10_000, cost: 100, count: 3 });

      const [result] = await service.findAllWithBalance();

      expect(result.fundsRunOutDate).toBeNull();
      expect(result.scheduledLessonsCovered).toBe(3);
    });

    it('predicts nothing when no classes are scheduled ahead', async () => {
      await seed({ balance: 100, cost: 100, count: 0 });

      const [result] = await service.findAllWithBalance();

      expect(result.fundsRunOutDate).toBeNull();
      expect(result.scheduledLessonsAhead).toBe(0);
    });

    it('ignores free classes rather than counting them as covered', async () => {
      await seed({ balance: 0, cost: 0, count: 4 });

      const [result] = await service.findAllWithBalance();

      expect(result.scheduledLessonsAhead).toBe(0);
      expect(result.fundsRunOutDate).toBeNull();
    });

    it('runs out immediately on the next class when the balance is already spent', async () => {
      const { starts } = await seed({ balance: 0, cost: 100, count: 2 });

      const [result] = await service.findAllWithBalance();

      expect(result.scheduledLessonsCovered).toBe(0);
      expect(result.fundsRunOutDate).toBe(starts[0]);
    });
  });

  describe('rescheduledLessonsOwed', () => {
    it('is 0 for a student with no attendance history', async () => {
      await service.create({
        name: 'No History',
        email: 'nohistory@example.com',
        semester: 'I',
      });

      const [result] = await service.findAllWithBalance();

      expect(result.rescheduledLessonsOwed).toBe(0);
    });

    it('counts every rescheduled marking', async () => {
      const student = await service.create({
        name: 'Owed Student',
        email: 'owed@example.com',
        semester: 'I',
      });
      const group = await dataSource.getRepository(Group).save({
        name: 'Owed Group',
        isActive: true,
        teacherId: 1,
        cost: 100,
        unitCost: 100,
        lessonLength: '01:00',
      });
      const cls = await dataSource.getRepository(ClassEntity).save({
        groupId: group.id,
        startTime: '2026-01-01T10:00:00.000Z',
        lessonLength: '01:00',
        cost: 100,
      });
      await dataSource.getRepository(ClassAttendance).save({
        classId: cls.id,
        studentId: student.id,
        status: AttendanceStatus.Rescheduled,
      });

      const [result] = await service.findAllWithBalance();

      expect(result.rescheduledLessonsOwed).toBe(1);
    });

    it('is reduced by attending a make-up lesson in a group the student does not belong to', async () => {
      const student = await service.create({
        name: 'Makeup Student',
        email: 'makeup@example.com',
        semester: 'I',
      });
      const ownGroup = await dataSource.getRepository(Group).save({
        name: 'Own Group',
        isActive: true,
        teacherId: 1,
        cost: 100,
        unitCost: 100,
        lessonLength: '01:00',
      });
      await dataSource
        .createQueryBuilder()
        .relation(Group, 'students')
        .of(ownGroup)
        .add(student.id);
      const missedClass = await dataSource.getRepository(ClassEntity).save({
        groupId: ownGroup.id,
        startTime: '2026-01-01T10:00:00.000Z',
        lessonLength: '01:00',
        cost: 100,
      });
      await dataSource.getRepository(ClassAttendance).save({
        classId: missedClass.id,
        studentId: student.id,
        status: AttendanceStatus.Rescheduled,
      });

      // A make-up lesson in a different group the student isn't a member of.
      const otherGroup = await dataSource.getRepository(Group).save({
        name: 'Other Group',
        isActive: true,
        teacherId: 1,
        cost: 100,
        unitCost: 100,
        lessonLength: '01:00',
      });
      const makeupClass = await dataSource.getRepository(ClassEntity).save({
        groupId: otherGroup.id,
        startTime: '2026-01-08T10:00:00.000Z',
        lessonLength: '01:00',
        cost: 100,
      });
      await dataSource.getRepository(ClassAttendance).save({
        classId: makeupClass.id,
        studentId: student.id,
        status: AttendanceStatus.Present,
      });

      const [result] = await service.findAllWithBalance();

      expect(result.rescheduledLessonsOwed).toBe(0);
    });

    it("does not reduce the balance for attendance in the student's own group", async () => {
      const student = await service.create({
        name: 'Own Group Attendee',
        email: 'owngroup@example.com',
        semester: 'I',
      });
      const group = await dataSource.getRepository(Group).save({
        name: 'Own Group Only',
        isActive: true,
        teacherId: 1,
        cost: 100,
        unitCost: 100,
        lessonLength: '01:00',
      });
      await dataSource
        .createQueryBuilder()
        .relation(Group, 'students')
        .of(group)
        .add(student.id);
      const missedClass = await dataSource.getRepository(ClassEntity).save({
        groupId: group.id,
        startTime: '2026-01-01T10:00:00.000Z',
        lessonLength: '01:00',
        cost: 100,
      });
      await dataSource.getRepository(ClassAttendance).save({
        classId: missedClass.id,
        studentId: student.id,
        status: AttendanceStatus.Rescheduled,
      });
      const normalClass = await dataSource.getRepository(ClassEntity).save({
        groupId: group.id,
        startTime: '2026-01-08T10:00:00.000Z',
        lessonLength: '01:00',
        cost: 100,
      });
      await dataSource.getRepository(ClassAttendance).save({
        classId: normalClass.id,
        studentId: student.id,
        status: AttendanceStatus.Present,
      });

      const [result] = await service.findAllWithBalance();

      // Attending their own group's regular class isn't a make-up — still owed.
      expect(result.rescheduledLessonsOwed).toBe(1);
    });
  });
});
