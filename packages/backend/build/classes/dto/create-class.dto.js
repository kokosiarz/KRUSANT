"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateClassDto", {
    enumerable: true,
    get: function() {
        return CreateClassDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateClassDto = class CreateClassDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Class start time (ISO datetime)',
        example: '2026-01-06T10:00:00.000Z'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateClassDto.prototype, "startTime", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Lesson length as time (HH:mm or HH:mm:ss)',
        example: '01:00'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateClassDto.prototype, "lessonLength", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Room ID',
        example: 201
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateClassDto.prototype, "roomId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Group ID',
        example: 10
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateClassDto.prototype, "groupId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        type: [
            Number
        ],
        description: 'IDs of planned students'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    _ts_metadata("design:type", Array)
], CreateClassDto.prototype, "plannedStudentsIds", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        type: [
            Number
        ],
        description: 'IDs of attended students'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    _ts_metadata("design:type", Array)
], CreateClassDto.prototype, "attendedStudentsIds", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        type: Number,
        description: 'Teacher ID'
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CreateClassDto.prototype, "teacherId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Class cost',
        example: 120
    }),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateClassDto.prototype, "cost", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Optional comment'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateClassDto.prototype, "comment", void 0);

//# sourceMappingURL=create-class.dto.js.map