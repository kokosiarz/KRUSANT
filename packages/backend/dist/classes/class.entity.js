"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClassEntity", {
    enumerable: true,
    get: function() {
        return ClassEntity;
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
let ClassEntity = class ClassEntity {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], ClassEntity.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], ClassEntity.prototype, "startTime", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], ClassEntity.prototype, "lessonLength", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], ClassEntity.prototype, "roomId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], ClassEntity.prototype, "groupId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], ClassEntity.prototype, "teacherId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2
    }),
    _ts_metadata("design:type", Number)
], ClassEntity.prototype, "cost", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], ClassEntity.prototype, "comment", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        default: '[]'
    }),
    _ts_metadata("design:type", Array)
], ClassEntity.prototype, "attendedStudentsIds", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        default: '[]'
    }),
    _ts_metadata("design:type", Array)
], ClassEntity.prototype, "plannedStudentsIds", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], ClassEntity.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _typeorm.UpdateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], ClassEntity.prototype, "updatedAt", void 0);
ClassEntity = _ts_decorate([
    (0, _typeorm.Entity)('class')
], ClassEntity);

//# sourceMappingURL=class.entity.js.map