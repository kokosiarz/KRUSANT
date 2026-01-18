"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TeachersController", {
    enumerable: true,
    get: function() {
        return TeachersController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _createteacherdto = require("./dto/create-teacher.dto");
const _teachersservice = require("./teachers.service");
const _batchupsertteacherdto = require("./dto/batch-upsert-teacher.dto");
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
let TeachersController = class TeachersController {
    getAllTeachers() {
        return this.teachersService.findAll();
    }
    createTeacher(body) {
        return this.teachersService.create(body);
    }
    deleteTeacher(id) {
        return this.teachersService.remove(parseInt(id));
    }
    batchUpsert(batchDto) {
        return this.teachersService.batchUpsert(batchDto.teachers);
    }
    constructor(teachersService){
        this.teachersService = teachersService;
    }
};
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get all teachers'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns all teachers'
    }),
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], TeachersController.prototype, "getAllTeachers", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Create new teacher'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Teacher created successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid input'
    }),
    (0, _common.Post)('/signup'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createteacherdto.CreateTeacherDto === "undefined" ? Object : _createteacherdto.CreateTeacherDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TeachersController.prototype, "createTeacher", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Delete teacher'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Teacher ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Teacher deleted successfully'
    }),
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", void 0)
], TeachersController.prototype, "deleteTeacher", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Batch create or update teachers by email'
    }),
    (0, _swagger.ApiBody)({
        type: _batchupsertteacherdto.BatchUpsertTeacherDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Teachers created/updated. Returns count and the processed teachers.'
    }),
    (0, _common.Post)('batch-upsert'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _batchupsertteacherdto.BatchUpsertTeacherDto === "undefined" ? Object : _batchupsertteacherdto.BatchUpsertTeacherDto
    ]),
    _ts_metadata("design:returntype", void 0)
], TeachersController.prototype, "batchUpsert", null);
TeachersController = _ts_decorate([
    (0, _swagger.ApiTags)('teachers'),
    (0, _common.Controller)('teachers'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _teachersservice.TeachersService === "undefined" ? Object : _teachersservice.TeachersService
    ])
], TeachersController);

//# sourceMappingURL=teachers.controller.js.map