"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GroupTemplate", {
    enumerable: true,
    get: function() {
        return GroupTemplate;
    }
});
const _typeorm = require("typeorm");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let GroupTemplate = class GroupTemplate {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], GroupTemplate.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], GroupTemplate.prototype, "templateName", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        nullable: true,
        default: true
    }),
    _ts_metadata("design:type", Boolean)
], GroupTemplate.prototype, "isActive", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        nullable: true,
        default: null
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "studentIds", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        nullable: true,
        default: null
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "classIds", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], GroupTemplate.prototype, "teacherId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], GroupTemplate.prototype, "cost", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], GroupTemplate.prototype, "unitCost", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        nullable: true,
        default: null
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "comment", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        nullable: true,
        default: null
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "minStartDate", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        nullable: true,
        default: null
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "maxEndDate", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        nullable: true,
        default: null
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "colorHex", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'time',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "startHour", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'time',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "lessonLength", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'integer',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "roomId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'integer',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], GroupTemplate.prototype, "courseId", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], GroupTemplate.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _typeorm.UpdateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], GroupTemplate.prototype, "updatedAt", void 0);
GroupTemplate = _ts_decorate([
    (0, _typeorm.Entity)()
], GroupTemplate);

//# sourceMappingURL=group-template.entity.js.map