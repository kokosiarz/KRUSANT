"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get ClassDto () {
        return ClassDto;
    },
    get CreateStudentDto () {
        return CreateStudentDto;
    },
    get PaymentDto () {
        return PaymentDto;
    }
});
const _debitdto = require("./debit.dto");
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
let PaymentDto = class PaymentDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Payment date',
        example: '2026-01-05'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], PaymentDto.prototype, "date", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Payment amount',
        example: 100.0
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], PaymentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Payment comment',
        example: 'Monthly payment'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], PaymentDto.prototype, "comment", void 0);
let ClassDto = class ClassDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Class date',
        example: '2026-01-05'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], ClassDto.prototype, "date", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Class cost',
        example: 50.0
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], ClassDto.prototype, "cost", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Class type',
        example: 'attended',
        enum: [
            'attended',
            'missed'
        ]
    }),
    (0, _classvalidator.IsEnum)([
        'attended',
        'missed'
    ]),
    _ts_metadata("design:type", String)
], ClassDto.prototype, "type", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Semester',
        example: 'V'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], ClassDto.prototype, "semester", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Teacher ID',
        example: 1
    }),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], ClassDto.prototype, "teacherId", void 0);
let CreateStudentDto = class CreateStudentDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Student name',
        example: 'John Doe'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateStudentDto.prototype, "name", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Student email',
        example: 'john.doe@example.com'
    }),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], CreateStudentDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Student phone number',
        example: '+1234567890'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateStudentDto.prototype, "phone", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Payment records',
        example: [
            {
                date: '2026-01-05',
                amount: 100.0,
                comment: 'Monthly payment'
            }
        ],
        default: [],
        type: [
            PaymentDto
        ]
    }),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>PaymentDto),
    _ts_metadata("design:type", Array)
], CreateStudentDto.prototype, "payments", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Class records',
        example: [
            {
                date: '2026-01-05',
                cost: 50.0,
                type: 'attended',
                semester: 'V',
                teacherId: 1
            }
        ],
        default: [],
        type: [
            ClassDto
        ]
    }),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>ClassDto),
    _ts_metadata("design:type", Array)
], CreateStudentDto.prototype, "classes", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Debit records',
        example: [
            {
                id: 1,
                dueDate: '2026-01-31',
                amount: 100.0,
                comment: 'January fee'
            }
        ],
        default: [],
        type: [
            _debitdto.DebitDto
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>_debitdto.DebitDto),
    _ts_metadata("design:type", Array)
], CreateStudentDto.prototype, "debits", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Custom rate for this student',
        example: 50.0
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateStudentDto.prototype, "customRate", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Discount percentage',
        example: 10.0
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateStudentDto.prototype, "discount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Current semester',
        example: 'V'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateStudentDto.prototype, "semester", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Additional notes',
        example: '',
        default: ''
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateStudentDto.prototype, "extraNotes", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Student active status',
        example: true,
        default: true
    }),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], CreateStudentDto.prototype, "active", void 0);

//# sourceMappingURL=create-student.dto.js.map