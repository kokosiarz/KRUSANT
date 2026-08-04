import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ActionLogService, Actor } from '../action-log/action-log.service';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  DeepPartial,
  EntityManager,
  In,
  Repository,
} from 'typeorm';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Course } from '../courses/course.entity';

export type GroupWithMembership = Omit<Group, 'students'> & {
  studentIds: number[];
  classIds: number[];
};

// Doesn't extend BaseCrudService: Group's response shape (studentIds/classIds
// derived from the students relation and class.groupId) differs from the entity
// shape on every method, so there's nothing left to usefully share.
@Injectable()
export class GroupsService implements OnModuleInit {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private dataSource: DataSource,
    private readonly actionLog: ActionLogService,
  ) {}

  /**
   * Teaches the action log how to reverse a group write. Registered here rather
   * than imported there, so the dependency only points one way.
   */
  onModuleInit(): void {
    this.actionLog.registerHandler('group', {
      load: async (id) => {
        try {
          return await this.findOne(id);
        } catch {
          return null;
        }
      },
      // Re-creates with the original id so anything referencing it (classes via
      // groupId) points at the right group again.
      restore: async (snapshot) => {
        await this.dataSource.transaction(async (manager) => {
          const repo = manager.getRepository(Group);
          const { studentIds, classIds, ...rest } = snapshot;
          await repo.save(repo.create(rest as DeepPartial<Group>));
          await this.syncMembership(manager, Number(snapshot.id), studentIds);
        });
      },
      revert: async (id, snapshot) => {
        const {
          studentIds,
          classIds,
          id: _id,
          createdAt,
          updatedAt,
          ...rest
        } = snapshot;
        await this.update(id, { ...rest, studentIds });
      },
      remove: async (id) => {
        await this.groupRepository.delete(id);
      },
    });
  }

  async remove(id: number, actor?: Actor): Promise<void> {
    // Captured before the delete so undo has something to restore.
    const before = await this.findOne(id);
    await this.groupRepository.delete(id);
    await this.actionLog.record({
      actor,
      entity: 'group',
      entityId: id,
      operation: 'delete',
      label: `Usunięto ${before.isTemplate ? 'szablon' : 'grupę'} „${before.name}”`,
      before,
    });
  }

  private toResponse(group: Group, classIds: number[]): GroupWithMembership {
    const { students, ...rest } = group;
    return {
      ...rest,
      studentIds: (students ?? []).map((s) => s.id),
      classIds,
    };
  }

  /**
   * Class ids per group, read from `class.groupId` — the single source of truth
   * for which group a class belongs to. This used to come from a `group_classes`
   * junction table that nothing ever wrote to, so every group reported an empty
   * class list.
   */
  private async findClassIdsByGroup(
    manager: EntityManager | DataSource,
    groupIds: number[],
  ): Promise<Map<number, number[]>> {
    const byGroup = new Map<number, number[]>();
    if (groupIds.length === 0) return byGroup;

    const rows = await manager.query<{ id: number; groupId: number }[]>(
      `SELECT id, "groupId" FROM class
        WHERE "groupId" IN (${groupIds.map(() => '?').join(',')})
        ORDER BY "startTime" ASC`,
      groupIds,
    );
    for (const { id, groupId } of rows) {
      const list = byGroup.get(groupId) ?? [];
      list.push(id);
      byGroup.set(groupId, list);
    }
    return byGroup;
  }

  private async loadOneWithMembership(
    repo: Repository<Group>,
    id: number,
  ): Promise<GroupWithMembership> {
    const group = await repo.findOne({
      where: { id },
      relations: { students: true },
    });
    if (!group) throw new NotFoundException(`Group ${id} not found`);
    const classIds = await this.findClassIdsByGroup(repo.manager, [id]);
    return this.toResponse(group, classIds.get(id) ?? []);
  }

  /**
   * Only touches the relation when the caller actually supplied studentIds
   * (PATCH semantics). Classes aren't membership — a class is assigned to a
   * group by setting its own `groupId`, via the Classes endpoints.
   */
  private async syncMembership(
    manager: EntityManager,
    groupId: number,
    studentIds: number[] | undefined,
  ): Promise<void> {
    if (studentIds === undefined) return;
    const relationBuilder = manager
      .createQueryBuilder()
      .relation(Group, 'students')
      .of(groupId);
    const current = await relationBuilder.loadMany<{ id: number }>();
    const currentIds = current.map((r) => r.id);
    const toAdd = studentIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentIds.filter((id) => !studentIds.includes(id));
    if (toAdd.length || toRemove.length) {
      await relationBuilder.addAndRemove(toAdd, toRemove);
    }
  }

  private async applyCourseDefaults(
    dto: CreateGroupDto,
  ): Promise<CreateGroupDto> {
    if (!dto.courseId) return dto;
    const course = await this.courseRepository.findOne({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new BadRequestException('Course not found');
    }
    const patched: CreateGroupDto = { ...dto };
    if (!patched.name) patched.name = course.name;
    if (patched.cost === undefined || patched.cost === null)
      patched.cost = Number(course.cost);
    if (patched.unitCost === undefined || patched.unitCost === null) {
      const hours = Number(course.numberOfHours);
      const cost = Number(course.cost);
      patched.unitCost = hours > 0 ? cost / hours : cost;
    }
    return patched;
  }

  // Templates live in the same table behind `isTemplate`. Callers always say
  // which side they want, so a template can never leak into a list of real
  // groups (or vice versa) by omission.
  async findAll(
    isTemplate: boolean,
    isActive?: boolean,
  ): Promise<GroupWithMembership[]> {
    const groups = await this.groupRepository.find({
      where: { isTemplate, ...(isActive !== undefined ? { isActive } : {}) },
      relations: { students: true },
    });
    // One lookup for the whole page rather than one per group.
    const classIds = await this.findClassIdsByGroup(
      this.dataSource,
      groups.map((g) => g.id),
    );
    return groups.map((g) => this.toResponse(g, classIds.get(g.id) ?? []));
  }

  /** A real group needs a teacher; a template is a blueprint and may not have one yet. */
  private assertRequiredFields(dto: CreateGroupDto): void {
    if (!dto.name) throw new BadRequestException('name is required');
    if (dto.cost === undefined || dto.unitCost === undefined) {
      throw new BadRequestException('cost and unitCost are required');
    }
    if (!dto.isTemplate && !dto.teacherId) {
      throw new BadRequestException('teacherId is required for a group');
    }
  }

  async findOne(id: number): Promise<GroupWithMembership> {
    return this.loadOneWithMembership(this.groupRepository, id);
  }

  async create(
    createGroupDto: CreateGroupDto,
    actor?: Actor,
  ): Promise<GroupWithMembership> {
    const patchedDto = await this.applyCourseDefaults(createGroupDto);
    this.assertRequiredFields(patchedDto);
    const { studentIds, ...rest } = patchedDto;
    const created = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Group);
      const saved = await repo.save(repo.create(rest as DeepPartial<Group>));
      await this.syncMembership(manager, saved.id, studentIds);
      return this.loadOneWithMembership(repo, saved.id);
    });
    await this.actionLog.record({
      actor,
      entity: 'group',
      entityId: created.id,
      operation: 'create',
      label: `Utworzono ${created.isTemplate ? 'szablon' : 'grupę'} „${created.name}”`,
      after: created,
    });
    return created;
  }

  async update(
    id: number,
    updateGroupDto: UpdateGroupDto,
    actor?: Actor,
  ): Promise<GroupWithMembership> {
    // Snapshot first — after the write the previous state is gone.
    const before = await this.findOne(id);
    const { studentIds, ...rest } = updateGroupDto;
    const updated = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Group);
      if (Object.keys(rest).length > 0) {
        await repo.update(id, rest);
      }
      await this.syncMembership(manager, id, studentIds);
      return this.loadOneWithMembership(repo, id);
    });
    await this.actionLog.record({
      actor,
      entity: 'group',
      entityId: id,
      operation: 'update',
      label: `Zmieniono ${updated.isTemplate ? 'szablon' : 'grupę'} „${updated.name}”`,
      before,
      after: updated,
    });
    return updated;
  }

  async batchUpsert(groups: CreateGroupDto[]): Promise<{
    created: number;
    updated: number;
    items: GroupWithMembership[];
  }> {
    const patched: CreateGroupDto[] = [];
    for (const groupDto of groups) {
      const patchedDto = await this.applyCourseDefaults(groupDto);
      this.assertRequiredFields(patchedDto);
      patched.push(patchedDto);
    }

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Group);
      const names = patched.map((g) => g.name).filter((n): n is string => !!n);
      const existing = names.length
        ? await repo.find({ where: { name: In(names) } })
        : [];
      const existingByName = new Map(existing.map((g) => [g.name, g]));

      const results: GroupWithMembership[] = [];
      let created = 0;
      let updated = 0;
      for (const dto of patched) {
        const { studentIds, ...rest } = dto;
        const match = dto.name ? existingByName.get(dto.name) : undefined;
        let saved: Group;
        if (match) {
          saved = await repo.save(
            repo.merge(match, rest as DeepPartial<Group>),
          );
          updated++;
        } else {
          saved = await repo.save(repo.create(rest as DeepPartial<Group>));
          created++;
        }
        await this.syncMembership(manager, saved.id, studentIds);
        results.push(await this.loadOneWithMembership(repo, saved.id));
      }
      return { created, updated, items: results };
    });
  }
}
