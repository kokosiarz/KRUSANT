"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CoursesService", {
    enumerable: true,
    get: function() {
        return CoursesService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _courseentity = require("./course.entity");
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
let CoursesService = class CoursesService {
    async findAll() {
        return await this.courseRepository.find();
    }
    async findOne(id) {
        return await this.courseRepository.findOne({
            where: {
                id
            }
        });
    }
    async create(createCourseDto) {
        const course = this.courseRepository.create(createCourseDto);
        return await this.courseRepository.save(course);
    }
    async update(id, updateCourseDto) {
        await this.courseRepository.update(id, updateCourseDto);
        return await this.findOne(id);
    }
    async remove(id) {
        await this.courseRepository.delete(id);
    }
    async batchUpsert(courses) {
        const results = [];
        let created = 0;
        let updated = 0;
        for (const courseDto of courses){
            // Find existing course by name
            const existingCourse = await this.courseRepository.findOne({
                where: {
                    name: courseDto.name
                }
            });
            if (existingCourse) {
                // Update existing course
                await this.courseRepository.update(existingCourse.id, courseDto);
                const updatedCourse = await this.findOne(existingCourse.id);
                results.push(updatedCourse);
                updated++;
            } else {
                // Create new course
                const newCourse = this.courseRepository.create(courseDto);
                const savedCourse = await this.courseRepository.save(newCourse);
                results.push(savedCourse);
                created++;
            }
        }
        return {
            created,
            updated,
            courses: results
        };
    }
    constructor(courseRepository){
        this.courseRepository = courseRepository;
    }
};
CoursesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_courseentity.Course)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], CoursesService);

//# sourceMappingURL=courses.service.js.map