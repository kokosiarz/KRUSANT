import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { Course } from '../courses/course.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class GroupsService extends BaseCrudService<Group> {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {
    super(groupRepository, { entityName: 'Group', uniqueBy: 'name' });
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

  async findAll(isActive?: boolean): Promise<Group[]> {
    if (isActive !== undefined) {
      return await this.groupRepository.find({ where: { isActive } });
    }
    return await this.groupRepository.find();
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const patchedDto = await this.applyCourseDefaults(createGroupDto);
    if (!patchedDto.name) throw new BadRequestException('name is required');
    if (patchedDto.cost === undefined || patchedDto.unitCost === undefined) {
      throw new BadRequestException('cost and unitCost are required');
    }
    return super.create(patchedDto);
  }

  async batchUpsert(
    groups: CreateGroupDto[],
  ): Promise<{ created: number; updated: number; items: Group[] }> {
    const patched: CreateGroupDto[] = [];
    for (const groupDto of groups) {
      const patchedDto = await this.applyCourseDefaults(groupDto);
      if (!patchedDto.name) throw new BadRequestException('name is required');
      if (patchedDto.cost === undefined || patchedDto.unitCost === undefined) {
        throw new BadRequestException('cost and unitCost are required');
      }
      patched.push(patchedDto);
    }
    return super.batchUpsert(patched);
  }
}
