import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Course } from '../courses/course.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  private async applyCourseDefaults(dto: CreateGroupDto): Promise<CreateGroupDto> {
    if (!dto.courseId) return dto;
    const course = await this.courseRepository.findOne({ where: { id: dto.courseId } });
    if (!course) {
      throw new BadRequestException('Course not found');
    }
    const patched: CreateGroupDto = { ...dto };
    if (!patched.name) patched.name = course.name;
    if (patched.cost === undefined || patched.cost === null) patched.cost = Number(course.cost);
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

  async findOne(id: number): Promise<Group> {
    return await this.groupRepository.findOne({ where: { id } });
  }

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const patchedDto = await this.applyCourseDefaults(createGroupDto);
    if (!patchedDto.name) throw new BadRequestException('name is required');
    if (patchedDto.cost === undefined || patchedDto.unitCost === undefined) {
      throw new BadRequestException('cost and unitCost are required');
    }
    const group = this.groupRepository.create(patchedDto);
    return await this.groupRepository.save(group);
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    await this.groupRepository.update(id, updateGroupDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.groupRepository.delete(id);
  }

  async batchUpsert(
    groups: CreateGroupDto[],
  ): Promise<{ created: number; updated: number; groups: Group[] }> {
    const results: Group[] = [];
    let created = 0;
    let updated = 0;

    for (const groupDto of groups) {
      const patchedDto = await this.applyCourseDefaults(groupDto);
      if (!patchedDto.name) throw new BadRequestException('name is required');
      if (patchedDto.cost === undefined || patchedDto.unitCost === undefined) {
        throw new BadRequestException('cost and unitCost are required');
      }
      // Find existing group by name
      const existingGroup = await this.groupRepository.findOne({
        where: { name: patchedDto.name },
      });

      if (existingGroup) {
        // Update existing group
        await this.groupRepository.update(existingGroup.id, patchedDto);
        const updatedGroup = await this.findOne(existingGroup.id);
        results.push(updatedGroup);
        updated++;
      } else {
        // Create new group
        const newGroup = this.groupRepository.create(patchedDto);
        const savedGroup = await this.groupRepository.save(newGroup);
        results.push(savedGroup);
        created++;
      }
    }

    return { created, updated, groups: results };
  }
}
