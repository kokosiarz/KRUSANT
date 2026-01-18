"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TeachersService", {
    enumerable: true,
    get: function() {
        return TeachersService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("typeorm");
const _typeorm1 = require("@nestjs/typeorm");
const _teacherentity = require("./entities/teacher.entity");
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
let TeachersService = class TeachersService {
    create(body) {
        const teacher = this.repo.create(body);
        return this.repo.save(teacher);
    }
    async findOneById(id) {
        const teacher = await this.repo.findOneBy({
            id
        });
        return teacher;
    }
    async findOneByEmail(email) {
        const teacher = await this.repo.findOneBy({
            email
        });
        return teacher;
    }
    findAll() {
        return this.repo.find();
    }
    async update(id, body) {
        const teacher = await this.repo.findOneBy({
            id
        });
        if (!teacher) {
            throw new Error('Teacher not found');
        }
        return this.repo.save({
            ...teacher,
            ...body
        });
    }
    remove(id) {
        return this.repo.delete(id);
    }
    async batchUpsert(teachers) {
        const results = [];
        let created = 0;
        let updated = 0;
        for (const teacherDto of teachers){
            // Find existing teacher by email
            const existingTeacher = await this.repo.findOne({
                where: {
                    email: teacherDto.email
                }
            });
            if (existingTeacher) {
                // Update existing teacher
                const updatedTeacher = await this.update(existingTeacher.id, teacherDto);
                results.push(updatedTeacher);
                updated++;
            } else {
                // Create new teacher
                const newTeacher = await this.create(teacherDto);
                results.push(newTeacher);
                created++;
            }
        }
        return {
            created,
            updated,
            teachers: results
        };
    }
    constructor(repo){
        this.repo = repo;
    }
};
TeachersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm1.InjectRepository)(_teacherentity.Teacher)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm.Repository === "undefined" ? Object : _typeorm.Repository
    ])
], TeachersService);

//# sourceMappingURL=teachers.service.js.map