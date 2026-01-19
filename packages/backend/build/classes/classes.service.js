"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClassesService", {
    enumerable: true,
    get: function() {
        return ClassesService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _classentity = require("./class.entity");
const _debitsservice = require("../debits/debits.service");
const _groupsservice = require("../groups/groups.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let ClassesService = class ClassesService {
    async findAll(groupId) {
        if (groupId !== undefined) {
            return await this.classRepository.find({
                where: {
                    groupId
                }
            });
        }
        return await this.classRepository.find();
    }
    async findOne(id) {
        return await this.classRepository.findOne({
            where: {
                id
            }
        });
    }
    async create(createDto) {
        const { attendedStudentsIds, plannedStudentsIds, teacherId, cost, comment, ...rest } = createDto;
        const entity = this.classRepository.create({
            ...rest,
            cost,
            comment
        });
        if (attendedStudentsIds) {
            entity.attendedStudentsIds = attendedStudentsIds;
        }
        if (plannedStudentsIds) {
            entity.plannedStudentsIds = plannedStudentsIds;
        }
        if (teacherId !== undefined) {
            entity.teacherId = teacherId;
        }
        if (cost !== undefined) {
            entity.cost = cost;
        }
        if (comment !== undefined) {
            entity.comment = comment;
        }
        return await this.classRepository.save(entity);
    }
    async update(id, updateDto) {
        await this.classRepository.update(id, updateDto);
        return await this.findOne(id);
    }
    async setAttendance(id, attendedStudentsIds) {
        const classEntity = await this.classRepository.findOne({
            where: {
                id
            }
        });
        if (!classEntity) throw new Error('Class not found');
        classEntity.attendedStudentsIds = Array.isArray(attendedStudentsIds) ? attendedStudentsIds.map(Number).filter((v)=>typeof v === 'number' && !isNaN(v)) : [];
        await this.classRepository.save(classEntity);
        // Prepare group name for entitlement
        let groupName = 'kurs';
        if (classEntity.groupId) {
            const group = await this.groupsService.findOne(classEntity.groupId);
            if (group && group.name) groupName = group.name;
        }
        const createdDebits = [];
        for (const studentId of attendedStudentsIds){
            // Check if a debit exists for this student and class
            const existing = await this.debitsService.findAll();
            const alreadyExists = existing.some((d)=>d.studentId === studentId && d.classId === classEntity.id);
            if (!alreadyExists) {
                // Fetch student to get discount
                const studentRepo = this.classRepository.manager.getRepository('Student');
                const student = await studentRepo.findOne({
                    where: {
                        id: studentId
                    }
                });
                let amount = classEntity.cost;
                if (student && typeof student.discount === 'number' && !isNaN(student.discount)) {
                    amount = Number(classEntity.cost) * (100 - Number(student.discount)) / 100;
                }
                const debit = await this.debitsService.create({
                    studentId,
                    classId: classEntity.id,
                    amount,
                    dueDate: classEntity.startTime ? new Date(classEntity.startTime) : new Date(),
                    entitlement: `${groupName} @ ${new Date(classEntity.startTime).toLocaleString('pl-PL')}`
                });
                createdDebits.push(debit);
            }
        }
        return {
            class: classEntity,
            createdDebits
        };
    }
    async remove(id) {
        await this.classRepository.delete(id);
    }
    async batchUpsert(classes) {
        const results = [];
        let created = 0;
        let updated = 0;
        for (const classDto of classes){
            // Find existing class by startTime and roomId
            const existingClass = await this.classRepository.findOne({
                where: {
                    startTime: classDto.startTime,
                    roomId: classDto.roomId
                }
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
        return {
            created,
            updated,
            classes: results
        };
    }
    async batchCreate(classes) {
        const created = [];
        for (const classDto of classes){
            const newClass = this.classRepository.create(classDto);
            const savedClass = await this.classRepository.save(newClass);
            created.push(savedClass);
        }
        return created;
    }
    constructor(classRepository, debitsService, groupsService){
        this.classRepository = classRepository;
        this.debitsService = debitsService;
        this.groupsService = groupsService;
    }
};
ClassesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_classentity.ClassEntity)),
    _ts_param(2, (0, _common.Inject)((0, _common.forwardRef)(()=>_groupsservice.GroupsService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _debitsservice.DebitsService === "undefined" ? Object : _debitsservice.DebitsService,
        typeof _groupsservice.GroupsService === "undefined" ? Object : _groupsservice.GroupsService
    ])
], ClassesService);

//# sourceMappingURL=classes.service.js.map