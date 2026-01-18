"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateCourseDto", {
    enumerable: true,
    get: function() {
        return CreateCourseDto;
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
let CreateCourseDto = class CreateCourseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Course name',
        example: 'Course A'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCourseDto.prototype, "name", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Course description',
        example: 'Intensive course description'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Course total cost',
        example: 3325.0
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateCourseDto.prototype, "cost", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Total number of hours',
        example: 70.0
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateCourseDto.prototype, "numberOfHours", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Length of each lesson as time (HH:mm or HH:mm:ss)',
        example: '02:30'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateCourseDto.prototype, "lessonLength", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Pattern of classes',
        example: 'workdays',
        enum: [
            'workdays',
            'weekends',
            'everyday',
            'weekly',
            'biweekly',
            'monthly'
        ]
    }),
    (0, _classvalidator.IsIn)([
        'workdays',
        'weekends',
        'everyday',
        'weekly',
        'biweekly',
        'monthly'
    ]),
    _ts_metadata("design:type", String)
], CreateCourseDto.prototype, "pattern", void 0);

//# sourceMappingURL=create-course.dto.js.map