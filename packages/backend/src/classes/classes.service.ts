import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from './class.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Student } from '../students/student.entity';
import { DebitsService } from '../debits/debits.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private classRepository: Repository<ClassEntity>,
    private debitsService: DebitsService,
    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
  ) {}

  async findAll(groupId?: number): Promise<ClassEntity[]> {
    if (groupId !== undefined) {
      return await this.classRepository.find({ where: { groupId } });
    }
    return await this.classRepository.find();
  }

  async findOne(id: number): Promise<ClassEntity> {
    return await this.classRepository.findOne({ where: { id } });
  }

  async create(createDto: CreateClassDto): Promise<ClassEntity> {
    const {
      attendedStudentsIds,
      plannedStudentsIds,
      teacherId,
      cost,
      comment,
      ...rest
    } = createDto;
    const entity = this.classRepository.create({ ...rest, cost, comment });
    if (attendedStudentsIds) {
      (entity as any).attendedStudentsIds = attendedStudentsIds;
    }
    if (plannedStudentsIds) {
      (entity as any).plannedStudentsIds = plannedStudentsIds;
    }
    if (teacherId !== undefined) {
      (entity as any).teacherId = teacherId;
    }
    if (cost !== undefined) {
      (entity as any).cost = cost;
    }
    if (comment !== undefined) {
      (entity as any).comment = comment;
    }
    return await this.classRepository.save(entity);
  }

  async update(id: number, updateDto: UpdateClassDto): Promise<ClassEntity> {
    await this.classRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async setAttendance(
    id: number,
    attendedStudentsIds: number[],
  ): Promise<{ class: ClassEntity; createdDebits: any[] }> {
    const classEntity = await this.classRepository.findOne({ where: { id } });
    if (!classEntity) throw new Error('Class not found');
    classEntity.attendedStudentsIds = Array.isArray(attendedStudentsIds)
      ? attendedStudentsIds
          .map(Number)
          .filter((v) => typeof v === 'number' && !isNaN(v))
      : [];
    await this.classRepository.save(classEntity);

    // Prepare group name for entitlement
    let groupName = 'kurs';
    if (classEntity.groupId) {
      const group = await this.groupsService.findOne(classEntity.groupId);
      if (group && group.name) groupName = group.name;
    }

    const createdDebits = [];
    for (const studentId of attendedStudentsIds) {
      // Check if a debit exists for this student and class
      const existing = await this.debitsService.findAll();
      const alreadyExists = existing.some(
        (d) => d.studentId === studentId && d.classId === classEntity.id,
      );
      if (!alreadyExists) {
        const debit = await this.debitsService.create({
          studentId,
          classId: classEntity.id,
          amount: classEntity.cost,
          dueDate: classEntity.startTime
            ? new Date(classEntity.startTime)
            : new Date(),
          entitlement: `${groupName} @ ${new Date(classEntity.startTime).toLocaleString('pl-PL')}`,
        });
        createdDebits.push(debit);
      }
    }

    return { class: classEntity, createdDebits };
  }

  async remove(id: number): Promise<void> {
    await this.classRepository.delete(id);
  }

  async batchUpsert(
    classes: CreateClassDto[],
  ): Promise<{ created: number; updated: number; classes: ClassEntity[] }> {
    const results: ClassEntity[] = [];
    let created = 0;
    let updated = 0;

    for (const classDto of classes) {
      // Find existing class by startTime and roomId
      const existingClass = await this.classRepository.findOne({
        where: { startTime: classDto.startTime, roomId: classDto.roomId },
      });

      if (existingClass) {
        // Update existing class
        await this.classRepository.update(existingClass.id, classDto);
        const updatedClass = await this.findOne(existingClass.id);
        results.push(updatedClass);
        updated++;
      } else {
        // Create new class
        const newClass = this.classRepository.create(classDto);
        const savedClass = await this.classRepository.save(newClass);
        results.push(savedClass);
        created++;
      }
    }

    return { created, updated, classes: results };
  }
}
