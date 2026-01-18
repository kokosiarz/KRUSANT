"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StudentsController", {
    enumerable: true,
    get: function() {
        return StudentsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _createstudentdto = require("./dto/create-student.dto");
const _updatestudentdto = require("./dto/update-student.dto");
const _batchupsertstudentdto = require("./dto/batch-upsert-student.dto");
const _studentsservice = require("./students.service");
const _passport = require("@nestjs/passport");
const _studentwithbalancedto = require("./dto/student-with-balance.dto");
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
let StudentsController = class StudentsController {
    async getAll(active) {
        const isActive = active === 'true' ? true : undefined;
        return await this.studentsService.findAll(isActive);
    }
    async getAllWithBalance(active) {
        const isActive = active === 'true' ? true : undefined;
        return await this.studentsService.findAllWithBalance(isActive);
    }
    async getByEmail(email) {
        return await this.studentsService.findByEmail(email);
    }
    async getOne(id) {
        return await this.studentsService.findOne(+id);
    }
    async create(student) {
        return await this.studentsService.create(student);
    }
    async update(id, student) {
        return await this.studentsService.update(+id, student);
    }
    async deleteStudent(id) {
        await this.studentsService.remove(+id);
        return {
            message: 'Student deleted successfully'
        };
    }
    async batchUpsert(batchDto) {
        return await this.studentsService.batchUpsert(batchDto.students);
    }
    constructor(studentsService){
        this.studentsService = studentsService;
    }
};
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get all students'
    }),
    (0, _swagger.ApiQuery)({
        name: 'active',
        required: false,
        enum: [
            'true',
            'false'
        ],
        description: 'Filter by active status'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns all students or filtered by active status'
    }),
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('active')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], StudentsController.prototype, "getAll", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get all students with financial balance'
    }),
    (0, _swagger.ApiQuery)({
        name: 'active',
        required: false,
        enum: [
            'true',
            'false'
        ],
        description: 'Filter by active status'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns all students with their financial balance',
        type: [
            _studentwithbalancedto.StudentWithBalanceDto
        ]
    }),
    (0, _common.Get)('with-balance'),
    _ts_param(0, (0, _common.Query)('active')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], StudentsController.prototype, "getAllWithBalance", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get student by email'
    }),
    (0, _swagger.ApiQuery)({
        name: 'email',
        description: 'Student email',
        example: 'student@example.com'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns student'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Student not found'
    }),
    (0, _common.Get)('search'),
    _ts_param(0, (0, _common.Query)('email')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], StudentsController.prototype, "getByEmail", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get student by ID'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Student ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns student'
    }),
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], StudentsController.prototype, "getOne", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Create new student'
    }),
    (0, _swagger.ApiBody)({
        type: _createstudentdto.CreateStudentDto
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Student created'
    }),
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createstudentdto.CreateStudentDto === "undefined" ? Object : _createstudentdto.CreateStudentDto
    ]),
    _ts_metadata("design:returntype", Promise)
], StudentsController.prototype, "create", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Update student'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Student ID'
    }),
    (0, _swagger.ApiBody)({
        type: _updatestudentdto.UpdateStudentDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Student updated'
    }),
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updatestudentdto.UpdateStudentDto === "undefined" ? Object : _updatestudentdto.UpdateStudentDto
    ]),
    _ts_metadata("design:returntype", Promise)
], StudentsController.prototype, "update", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Delete student'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Student ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Student deleted'
    }),
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], StudentsController.prototype, "deleteStudent", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Batch create or update students by email'
    }),
    (0, _swagger.ApiBody)({
        type: _batchupsertstudentdto.BatchUpsertStudentDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Students created/updated. Returns count and the processed students.'
    }),
    (0, _common.Post)('batch-upsert'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _batchupsertstudentdto.BatchUpsertStudentDto === "undefined" ? Object : _batchupsertstudentdto.BatchUpsertStudentDto
    ]),
    _ts_metadata("design:returntype", Promise)
], StudentsController.prototype, "batchUpsert", null);
StudentsController = _ts_decorate([
    (0, _swagger.ApiTags)('students'),
    (0, _common.Controller)('students'),
    (0, _common.UseGuards)((0, _passport.AuthGuard)('jwt')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _studentsservice.StudentsService === "undefined" ? Object : _studentsservice.StudentsService
    ])
], StudentsController);

//# sourceMappingURL=students.controller.js.map