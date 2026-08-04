import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ActionLogService } from '../action-log/action-log.service';
import { GroupsService } from './groups.service';
import { Group } from './group.entity';
import { Course } from '../courses/course.entity';
import { Student } from '../students/student.entity';
import { ClassEntity } from '../classes/class.entity';
// Student declares relations to Payment/Debit, so they have to be registered
// here too or TypeORM fails to build entity metadata.
import { Payment } from '../payments/payment.entity';
import { Debit } from '../debits/debit.entity';
import { CreateGroupDto } from './dto/create-group.dto';

describe('GroupsService', () => {
  let service: GroupsService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Group, Course, Student, ClassEntity, Payment, Debit],
          synchronize: true,
          retryAttempts: 0,
        }),
        TypeOrmModule.forFeature([Group, Course]),
      ],
      providers: [
        // The services record every write; this spec is about the write
        // itself, so the log is a no-op stand-in.
        {
          provide: ActionLogService,
          useValue: { record: jest.fn(), registerHandler: jest.fn() },
        },
        GroupsService,
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const makeGroup = () =>
    service.create({
      name: `Group ${Math.random()}`,
      isTemplate: false,
      teacherId: 1,
      cost: 1000,
      unitCost: 100,
    });

  const addClass = (groupId: number | undefined, startTime: string) =>
    dataSource.getRepository(ClassEntity).save({
      groupId,
      startTime,
      lessonLength: '01:00',
      cost: 100,
    });

  // Regression: classIds used to be read from a `group_classes` junction table
  // that nothing ever wrote to, so every group reported an empty class list no
  // matter how many classes pointed at it. It now comes from class.groupId.
  describe('classIds', () => {
    it('reports the classes whose groupId points at the group', async () => {
      const group = await makeGroup();
      const a = await addClass(group.id, '2026-09-01T10:00:00.000Z');
      const b = await addClass(group.id, '2026-09-08T10:00:00.000Z');

      expect((await service.findOne(group.id)).classIds).toEqual([a.id, b.id]);
    });

    it('orders them by start time, not insertion order', async () => {
      const group = await makeGroup();
      const later = await addClass(group.id, '2026-09-08T10:00:00.000Z');
      const earlier = await addClass(group.id, '2026-09-01T10:00:00.000Z');

      expect((await service.findOne(group.id)).classIds).toEqual([
        earlier.id,
        later.id,
      ]);
    });

    it("does not leak another group's classes", async () => {
      const mine = await makeGroup();
      const theirs = await makeGroup();
      const ours = await addClass(mine.id, '2026-09-01T10:00:00.000Z');
      await addClass(theirs.id, '2026-09-02T10:00:00.000Z');

      expect((await service.findOne(mine.id)).classIds).toEqual([ours.id]);
    });

    it('ignores classes not assigned to any group', async () => {
      const group = await makeGroup();
      await addClass(undefined, '2026-09-01T10:00:00.000Z');

      expect((await service.findOne(group.id)).classIds).toEqual([]);
    });

    it('is populated in list responses too', async () => {
      const first = await makeGroup();
      const second = await makeGroup();
      const a = await addClass(first.id, '2026-09-01T10:00:00.000Z');
      const b = await addClass(second.id, '2026-09-02T10:00:00.000Z');

      const groups = await service.findAll(false);

      expect(groups.find((g) => g.id === first.id)?.classIds).toEqual([a.id]);
      expect(groups.find((g) => g.id === second.id)?.classIds).toEqual([b.id]);
    });
  });
});
