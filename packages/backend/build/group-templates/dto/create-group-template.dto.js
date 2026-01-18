"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateGroupTemplateDto", {
    enumerable: true,
    get: function() {
        return CreateGroupTemplateDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DateBoundaryDto = class DateBoundaryDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Day of month',
        example: 1,
        minimum: 1,
        maximum: 31
    }),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(31),
    _ts_metadata("design:type", Number)
], DateBoundaryDto.prototype, "day", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Month (1-12)',
        example: 1,
        minimum: 1,
        maximum: 12
    }),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    (0, _classvalidator.Max)(12),
    _ts_metadata("design:type", Number)
], DateBoundaryDto.prototype, "month", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Year (optional)',
        example: 2026
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsInt)(),
    _ts_metadata("design:type", Number)
], DateBoundaryDto.prototype, "year", void 0);
let CreateGroupTemplateDto = class CreateGroupTemplateDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Template name',
        example: 'Evening Regular'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateGroupTemplateDto.prototype, "templateName", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Active status',
        example: true,
        default: true
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], CreateGroupTemplateDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Student IDs',
        example: [
            1,
            2
        ],
        default: []
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsNumber)({}, {
        each: true
    }),
    _ts_metadata("design:type", Array)
], CreateGroupTemplateDto.prototype, "studentIds", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Class IDs',
        example: [
            1,
            2
        ],
        default: []
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsNumber)({}, {
        each: true
    }),
    _ts_metadata("design:type", Array)
], CreateGroupTemplateDto.prototype, "classIds", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Teacher ID',
        example: 1
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateGroupTemplateDto.prototype, "teacherId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Total course cost',
        example: 3325.0
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateGroupTemplateDto.prototype, "cost", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Cost per unit',
        example: 50.0
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateGroupTemplateDto.prototype, "unitCost", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Additional comments',
        example: ''
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateGroupTemplateDto.prototype, "comment", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Minimum start date constraint',
        type: DateBoundaryDto
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.ValidateNested)(),
    (0, _classtransformer.Type)(()=>DateBoundaryDto),
    _ts_metadata("design:type", typeof DateBoundaryDto === "undefined" ? Object : DateBoundaryDto)
], CreateGroupTemplateDto.prototype, "minStartDate", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Maximum end date constraint',
        type: DateBoundaryDto
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.ValidateNested)(),
    (0, _classtransformer.Type)(()=>DateBoundaryDto),
    _ts_metadata("design:type", typeof DateBoundaryDto === "undefined" ? Object : DateBoundaryDto)
], CreateGroupTemplateDto.prototype, "maxEndDate", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Template color hex for visual identification',
        example: '#4CAF50'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateGroupTemplateDto.prototype, "colorHex", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Default start time (HH:mm or HH:mm:ss)',
        example: '09:00',
        type: String,
        format: 'time'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateGroupTemplateDto.prototype, "startHour", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Lesson duration as time (HH:mm or HH:mm:ss)',
        example: '01:00',
        type: String,
        format: 'time'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateGroupTemplateDto.prototype, "lessonLength", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Room ID',
        example: 1
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateGroupTemplateDto.prototype, "roomId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Course ID',
        example: 1
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateGroupTemplateDto.prototype, "courseId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Number of hours for the group template',
        example: 40
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateGroupTemplateDto.prototype, "numberOfHours", void 0);

//# sourceMappingURL=create-group-template.dto.js.map