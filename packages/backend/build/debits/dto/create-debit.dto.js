"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateDebitDto", {
    enumerable: true,
    get: function() {
        return CreateDebitDto;
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
let CreateDebitDto = class CreateDebitDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: 'date',
        example: '2026-01-15'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], CreateDebitDto.prototype, "dueDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: 'number',
        example: 100.50
    }),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateDebitDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        type: 'string',
        example: 'Some comment'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDebitDto.prototype, "comment", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        type: 'string',
        example: 'Scholarship'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDebitDto.prototype, "entitlement", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: 'number',
        example: 1
    }),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateDebitDto.prototype, "studentId", void 0);

//# sourceMappingURL=create-debit.dto.js.map