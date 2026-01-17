"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DebitDto", {
    enumerable: true,
    get: function() {
        return DebitDto;
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
let DebitDto = class DebitDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Debit ID',
        example: 1
    }),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], DebitDto.prototype, "id", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Due date',
        example: '2026-01-31'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], DebitDto.prototype, "dueDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Amount',
        example: 100.0
    }),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], DebitDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Comment',
        example: 'January fee'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], DebitDto.prototype, "comment", void 0);

//# sourceMappingURL=debit.dto.js.map