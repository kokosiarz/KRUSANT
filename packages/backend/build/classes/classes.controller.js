"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClassesController", {
    enumerable: true,
    get: function() {
        return ClassesController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _classesservice = require("./classes.service");
const _batchupsertclassdto = require("./dto/batch-upsert-class.dto");
const _createclassdto = require("./dto/create-class.dto");
const _updateclassdto = require("./dto/update-class.dto");
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
let ClassesController = class ClassesController {
    async getAll(groupId) {
        const gid = groupId !== undefined ? Number(groupId) : undefined;
        return await this.classesService.findAll(gid);
    }
    async getOne(id) {
        return await this.classesService.findOne(+id);
    }
    async create(body) {
        return await this.classesService.create(body);
    }
    async update(id, body) {
        return await this.classesService.update(+id, body);
    }
    async delete(id) {
        await this.classesService.remove(+id);
        return {
            message: 'Class deleted successfully'
        };
    }
    async setAttendance(id, attendedStudentsIds) {
        return await this.classesService.setAttendance(+id, attendedStudentsIds);
    }
    async batchUpsert(batchDto) {
        return await this.classesService.batchUpsert(batchDto.classes);
    }
    async batchCreate(classes) {
        return await this.classesService.batchCreate(classes);
    }
    constructor(classesService){
        this.classesService = classesService;
    }
};
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get all classes'
    }),
    (0, _swagger.ApiQuery)({
        name: 'groupId',
        required: false,
        description: 'Filter by group ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns all classes or filtered by group ID'
    }),
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('groupId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ClassesController.prototype, "getAll", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get class by ID'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Class ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns class'
    }),
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ClassesController.prototype, "getOne", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Create new class'
    }),
    (0, _swagger.ApiBody)({
        type: _createclassdto.CreateClassDto
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Class created'
    }),
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createclassdto.CreateClassDto === "undefined" ? Object : _createclassdto.CreateClassDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ClassesController.prototype, "create", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Update class'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Class ID'
    }),
    (0, _swagger.ApiBody)({
        type: _updateclassdto.UpdateClassDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Class updated'
    }),
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateclassdto.UpdateClassDto === "undefined" ? Object : _updateclassdto.UpdateClassDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ClassesController.prototype, "update", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Delete class'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Class ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Class deleted'
    }),
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], ClassesController.prototype, "delete", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Set attendance for a class'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Class ID'
    }),
    (0, _swagger.ApiBody)({
        type: [
            Number
        ]
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Attendance set, returns class and created debits'
    }),
    (0, _common.Post)(':id/attendance'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Array
    ]),
    _ts_metadata("design:returntype", Promise)
], ClassesController.prototype, "setAttendance", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Batch create or update classes by startTime and roomId'
    }),
    (0, _swagger.ApiBody)({
        type: _batchupsertclassdto.BatchUpsertClassDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Classes created/updated. Returns count and the processed classes.'
    }),
    (0, _common.Post)('batch-upsert'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _batchupsertclassdto.BatchUpsertClassDto === "undefined" ? Object : _batchupsertclassdto.BatchUpsertClassDto
    ]),
    _ts_metadata("design:returntype", Promise)
], ClassesController.prototype, "batchUpsert", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Batch create classes'
    }),
    (0, _swagger.ApiBody)({
        type: [
            _createclassdto.CreateClassDto
        ]
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Classes created'
    }),
    (0, _common.Post)('batch'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Array
    ]),
    _ts_metadata("design:returntype", Promise)
], ClassesController.prototype, "batchCreate", null);
ClassesController = _ts_decorate([
    (0, _swagger.ApiTags)('classes'),
    (0, _common.Controller)('classes'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _classesservice.ClassesService === "undefined" ? Object : _classesservice.ClassesService
    ])
], ClassesController);

//# sourceMappingURL=classes.controller.js.map