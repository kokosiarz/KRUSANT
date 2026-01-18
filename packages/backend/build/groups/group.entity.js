"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Group", {
    enumerable: true,
    get: function() {
        return Group;
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
let Group = class Group {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], Group.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Group.prototype, "name", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        default: true
    }),
    _ts_metadata("design:type", Boolean)
], Group.prototype, "isActive", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        default: '[]'
    }),
    _ts_metadata("design:type", Array)
], Group.prototype, "studentIds", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        default: '[]'
    }),
    _ts_metadata("design:type", Array)
], Group.prototype, "classIds", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], Group.prototype, "minStartDate", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'json',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], Group.prototype, "maxEndDate", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", Number)
], Group.prototype, "teacherId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2
    }),
    _ts_metadata("design:type", Number)
], Group.prototype, "cost", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2
    }),
    _ts_metadata("design:type", Number)
], Group.prototype, "unitCost", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'integer',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], Group.prototype, "numberOfHours", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'int',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], Group.prototype, "roomId", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        default: ''
    }),
    _ts_metadata("design:type", String)
], Group.prototype, "comment", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        nullable: true,
        default: null
    }),
    _ts_metadata("design:type", Object)
], Group.prototype, "colorHex", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'time',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], Group.prototype, "startHour", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'time',
        nullable: true
    }),
    _ts_metadata("design:type", Object)
], Group.prototype, "lessonLength", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Group.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _typeorm.UpdateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Group.prototype, "updatedAt", void 0);
Group = _ts_decorate([
    (0, _typeorm.Entity)()
], Group);

//# sourceMappingURL=group.entity.js.map