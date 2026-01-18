"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GroupsService", {
    enumerable: true,
    get: function() {
        return GroupsService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _groupentity = require("./group.entity");
const _courseentity = require("../courses/course.entity");
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
let GroupsService = class GroupsService {
    async applyCourseDefaults(dto) {
        if (!dto.courseId) return dto;
        const course = await this.courseRepository.findOne({
            where: {
                id: dto.courseId
            }
        });
        if (!course) {
            throw new _common.BadRequestException('Course not found');
        }
        const patched = {
            ...dto
        };
        if (!patched.name) patched.name = course.name;
        if (patched.cost === undefined || patched.cost === null) patched.cost = Number(course.cost);
        if (patched.unitCost === undefined || patched.unitCost === null) {
            const hours = Number(course.numberOfHours);
            const cost = Number(course.cost);
            patched.unitCost = hours > 0 ? cost / hours : cost;
        }
        return patched;
    }
    async findAll(isActive) {
        if (isActive !== undefined) {
            return await this.groupRepository.find({
                where: {
                    isActive
                }
            });
        }
        return await this.groupRepository.find();
    }
    async findOne(id) {
        return await this.groupRepository.findOne({
            where: {
                id
            }
        });
    }
    async create(createGroupDto) {
        const patchedDto = await this.applyCourseDefaults(createGroupDto);
        if (!patchedDto.name) throw new _common.BadRequestException('name is required');
        if (patchedDto.cost === undefined || patchedDto.unitCost === undefined) {
            throw new _common.BadRequestException('cost and unitCost are required');
        }
        const group = this.groupRepository.create(patchedDto);
        return await this.groupRepository.save(group);
    }
    async update(id, updateGroupDto) {
        await this.groupRepository.update(id, updateGroupDto);
        return await this.findOne(id);
    }
    async remove(id) {
        await this.groupRepository.delete(id);
    }
    async batchUpsert(groups) {
        const results = [];
        let created = 0;
        let updated = 0;
        for (const groupDto of groups){
            const patchedDto = await this.applyCourseDefaults(groupDto);
            if (!patchedDto.name) throw new _common.BadRequestException('name is required');
            if (patchedDto.cost === undefined || patchedDto.unitCost === undefined) {
                throw new _common.BadRequestException('cost and unitCost are required');
            }
            // Find existing group by name
            const existingGroup = await this.groupRepository.findOne({
                where: {
                    name: patchedDto.name
                }
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
        return {
            created,
            updated,
            groups: results
        };
    }
    constructor(groupRepository, courseRepository){
        this.groupRepository = groupRepository;
        this.courseRepository = courseRepository;
    }
};
GroupsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_groupentity.Group)),
    _ts_param(1, (0, _typeorm.InjectRepository)(_courseentity.Course)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], GroupsService);

//# sourceMappingURL=groups.service.js.map