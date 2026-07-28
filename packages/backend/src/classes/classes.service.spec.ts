import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ClassesService } from './classes.service';
import { ClassEntity } from './class.entity';
import { Student } from '../students/student.entity';
import { Debit } from '../debits/debit.entity';
import { Payment } from '../payments/payment.entity';
import { GroupsService } from '../groups/groups.service';

describe('ClassesService', () => {
  let service: ClassesService;
  let dataSource: DataSource;
  let classId: number;
  let studentA: Student;
  let studentB: Student;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [ClassEntity, Student, Debit, Payment],
          synchronize: true,
          retryAttempts: 0,
        }),
        TypeOrmModule.forFeature([ClassEntity]),
      ],
      providers: [
        ClassesService,
        {
          provide: GroupsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ name: 'Test Group' }),
          },
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    dataSource = module.get<DataSource>(DataSource);

    studentA = await dataSource
      .getRepository(Student)
      .save({ name: 'Student A', email: 'a@example.com', semester: 'I' });
    studentB = await dataSource.getRepository(Student).save({
      name: 'Student B',
      email: 'b@example.com',
      semester: 'I',
      discount: 20,
    });

    const classEntity = await dataSource.getRepository(ClassEntity).save({
      startTime: '2026-01-01T10:00:00.000Z',
      lessonLength: '01:00',
      groupId: 1,
      cost: 100,
      attendedStudentsIds: [],
      plannedStudentsIds: [],
    });
    classId = classEntity.id;
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it("creates a debit per attending student, applying each student's discount", async () => {
    const { createdDebits } = await service.setAttendance(classId, [
      studentA.id,
      studentB.id,
    ]);

    expect(createdDebits).toHaveLength(2);
    const byStudent = new Map(createdDebits.map((d) => [d.studentId, d]));
    expect(Number(byStudent.get(studentA.id).amount)).toBe(100);
    expect(Number(byStudent.get(studentB.id).amount)).toBe(80); // 20% discount

    const allDebits = await dataSource
      .getRepository(Debit)
      .find({ where: { classId } });
    expect(allDebits).toHaveLength(2);
  });

  it('is idempotent: marking the same students again creates no duplicate debits', async () => {
    await service.setAttendance(classId, [studentA.id, studentB.id]);
    const { createdDebits } = await service.setAttendance(classId, [
      studentA.id,
      studentB.id,
    ]);

    expect(createdDebits).toHaveLength(0);
    const allDebits = await dataSource
      .getRepository(Debit)
      .find({ where: { classId } });
    expect(allDebits).toHaveLength(2);
  });

  it('removes the debit for a student who is un-marked, leaving the others untouched', async () => {
    await service.setAttendance(classId, [studentA.id, studentB.id]);

    await service.setAttendance(classId, [studentA.id]);

    const remaining = await dataSource
      .getRepository(Debit)
      .find({ where: { classId } });
    expect(remaining).toHaveLength(1);
    expect(remaining[0].studentId).toBe(studentA.id);
  });

  it('updates the class attendedStudentsIds to match what was passed in', async () => {
    const { class: updated } = await service.setAttendance(classId, [
      studentA.id,
    ]);
    expect(updated.attendedStudentsIds).toEqual([studentA.id]);
  });
});
