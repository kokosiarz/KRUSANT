"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CoursesController", {
    enumerable: true,
    get: function() {
        return CoursesController;
    }
});
const _batchupsertcoursedto = require("./dto/batch-upsert-course.dto");
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _coursesservice = require("./courses.service");
const _createcoursedto = require("./dto/create-course.dto");
const _updatecoursedto = require("./dto/update-course.dto");
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
let CoursesController = class CoursesController {
    async getAll() {
        return await this.coursesService.findAll();
    }
    async getOne(id) {
        return await this.coursesService.findOne(+id);
    }
    async create(course) {
        return await this.coursesService.create(course);
    }
    async update(id, course) {
        return await this.coursesService.update(+id, course);
    }
    async deleteCourse(id) {
        await this.coursesService.remove(+id);
        return {
            message: 'Course deleted successfully'
        };
    }
    async batchUpsert(batchDto) {
        return await this.coursesService.batchUpsert(batchDto.courses);
    }
    constructor(coursesService){
        this.coursesService = coursesService;
    }
};
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get all courses'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns all courses'
    }),
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], CoursesController.prototype, "getAll", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get course by ID'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Course ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns course'
    }),
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], CoursesController.prototype, "getOne", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Create new course'
    }),
    (0, _swagger.ApiBody)({
        type: _createcoursedto.CreateCourseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Course created'
    }),
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcoursedto.CreateCourseDto === "undefined" ? Object : _createcoursedto.CreateCourseDto
    ]),
    _ts_metadata("design:returntype", Promise)
], CoursesController.prototype, "create", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Update course'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Course ID'
    }),
    (0, _swagger.ApiBody)({
        type: _updatecoursedto.UpdateCourseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Course updated'
    }),
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatecoursedto.UpdateCourseDto === "undefined" ? Object : _updatecoursedto.UpdateCourseDto
    ]),
    _ts_metadata("design:returntype", Promise)
], CoursesController.prototype, "update", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Delete course'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Course ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Course deleted'
    }),
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], CoursesController.prototype, "deleteCourse", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Batch create or update courses by name'
    }),
    (0, _swagger.ApiBody)({
        type: _batchupsertcoursedto.BatchUpsertCourseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Courses created/updated. Returns count and the processed courses.'
    }),
    (0, _common.Post)('batch-upsert'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _batchupsertcoursedto.BatchUpsertCourseDto === "undefined" ? Object : _batchupsertcoursedto.BatchUpsertCourseDto
    ]),
    _ts_metadata("design:returntype", Promise)
], CoursesController.prototype, "batchUpsert", null);
CoursesController = _ts_decorate([
    (0, _swagger.ApiTags)('courses'),
    (0, _common.Controller)('courses'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _coursesservice.CoursesService === "undefined" ? Object : _coursesservice.CoursesService
    ])
], CoursesController);

//# sourceMappingURL=courses.controller.js.map