import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, DeepPartial, EntityManager, In, Repository } from 'typeorm';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Course } from '../courses/course.entity';

export type GroupWithMembership = Omit<Group, 'students' | 'classes'> & {
  studentIds: number[];
  classIds: number[];
};

// Doesn't extend BaseCrudService: Group's response shape (studentIds/classIds
// derived from the students/classes relations) differs from the entity shape
// on every method, so there's nothing left to usefully share.
@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private dataSource: DataSource,
  ) {}

  async remove(id: number): Promise<void> {
    await this.groupRepository.delete(id);
  }

  private toResponse(group: Group): GroupWithMembership {
    const { students, classes, ...rest } = group;
    return {
      ...rest,
      studentIds: (students ?? []).map((s) => s.id),
      classIds: (classes ?? []).map((c) => c.id),
    };
  }

  private async loadOneWithMembership(
    repo: Repository<Group>,
    id: number,
  ): Promise<GroupWithMembership> {
    const group = await repo.findOne({
      where: { id },
      relations: { students: true, classes: true },
    });
    if (!group) throw new NotFoundException(`Group ${id} not found`);
    return this.toResponse(group);
  }

  /** Only touches a relation when the caller actually supplied that field (PATCH semantics). */
  private async syncMembership(
    manager: EntityManager,
    groupId: number,
    studentIds: number[] | undefined,
    classIds: number[] | undefined,
  ): Promise<void> {
    for (const [relation, ids] of [
      ['students', studentIds] as const,
      ['classes', classIds] as const,
    ]) {
      if (ids === undefined) continue;
      const relationBuilder = manager
        .createQueryBuilder()
        .relation(Group, relation)
        .of(groupId);
      const current = await relationBuilder.loadMany<{ id: number }>();
      const currentIds = current.map((r) => r.id);
      const toAdd = ids.filter((id) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id) => !ids.includes(id));
      if (toAdd.length || toRemove.length) {
        await relationBuilder.addAndRemove(toAdd, toRemove);
      }
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

  async findAll(isActive?: boolean): Promise<GroupWithMembership[]> {
    const groups = await this.groupRepository.find({
      where: isActive !== undefined ? { isActive } : {},
      relations: { students: true, classes: true },
    });
    return groups.map((g) => this.toResponse(g));
  }

  async findOne(id: number): Promise<GroupWithMembership> {
    return this.loadOneWithMembership(this.groupRepository, id);
  }

  async create(createGroupDto: CreateGroupDto): Promise<GroupWithMembership> {
    const patchedDto = await this.applyCourseDefaults(createGroupDto);
    if (!patchedDto.name) throw new BadRequestException('name is required');
    if (patchedDto.cost === undefined || patchedDto.unitCost === undefined) {
      throw new BadRequestException('cost and unitCost are required');
    }
    const { studentIds, classIds, ...rest } = patchedDto;
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Group);
      const saved = await repo.save(repo.create(rest as DeepPartial<Group>));
      await this.syncMembership(manager, saved.id, studentIds, classIds);
      return this.loadOneWithMembership(repo, saved.id);
    });
  }

  async update(
    id: number,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupWithMembership> {
    const { studentIds, classIds, ...rest } = updateGroupDto;
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Group);
      if (Object.keys(rest).length > 0) {
        await repo.update(id, rest as DeepPartial<Group>);
      }
      await this.syncMembership(manager, id, studentIds, classIds);
      return this.loadOneWithMembership(repo, id);
    });
  }

  async batchUpsert(
    groups: CreateGroupDto[],
  ): Promise<{ created: number; updated: number; items: GroupWithMembership[] }> {
    const patched: CreateGroupDto[] = [];
    for (const groupDto of groups) {
      const patchedDto = await this.applyCourseDefaults(groupDto);
      if (!patchedDto.name) throw new BadRequestException('name is required');
      if (patchedDto.cost === undefined || patchedDto.unitCost === undefined) {
        throw new BadRequestException('cost and unitCost are required');
      }
      patched.push(patchedDto);
    }

    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Group);
      const names = patched
        .map((g) => g.name)
        .filter((n): n is string => !!n);
      const existing = names.length
        ? await repo.find({ where: { name: In(names) } })
        : [];
      const existingByName = new Map(existing.map((g) => [g.name, g]));

      const results: GroupWithMembership[] = [];
      let created = 0;
      let updated = 0;
      for (const dto of patched) {
        const { studentIds, classIds, ...rest } = dto;
        const match = dto.name ? existingByName.get(dto.name) : undefined;
        let saved: Group;
        if (match) {
          saved = await repo.save(repo.merge(match, rest as DeepPartial<Group>));
          updated++;
        } else {
          saved = await repo.save(repo.create(rest as DeepPartial<Group>));
          created++;
        }
        await this.syncMembership(manager, saved.id, studentIds, classIds);
        results.push(await this.loadOneWithMembership(repo, saved.id));
      }
      return { created, updated, items: results };
    });
  }
}
