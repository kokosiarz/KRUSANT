"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreatePaymentDto", {
    enumerable: true,
    get: function() {
        return CreatePaymentDto;
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
let CreatePaymentDto = class CreatePaymentDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: 'date',
        example: '2026-01-15'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreatePaymentDto.prototype, "date", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: 'number',
        example: 100.50
    }),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreatePaymentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        type: 'string',
        example: 'Some comment'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePaymentDto.prototype, "comment", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: [
            'receipt',
            'invoice'
        ],
        example: 'receipt'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsIn)([
        'receipt',
        'invoice'
    ]),
    _ts_metadata("design:type", String)
], CreatePaymentDto.prototype, "proofType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: 'boolean',
        example: false
    }),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], CreatePaymentDto.prototype, "fiscalized", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        type: 'number',
        example: 123
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreatePaymentDto.prototype, "invoiceId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        type: 'number',
        example: 1
    }),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreatePaymentDto.prototype, "studentId", void 0);

//# sourceMappingURL=create-payment.dto.js.map