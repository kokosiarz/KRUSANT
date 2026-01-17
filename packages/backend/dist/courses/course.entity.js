"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Course", {
    enumerable: true,
    get: function() {
        return Course;
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
let Course = class Course {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], Course.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Course.prototype, "name", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        default: ''
    }),
    _ts_metadata("design:type", String)
], Course.prototype, "description", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2
    }),
    _ts_metadata("design:type", Number)
], Course.prototype, "cost", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2
    }),
    _ts_metadata("design:type", Number)
], Course.prototype, "numberOfHours", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'time',
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Course.prototype, "lessonLength", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'varchar',
        length: 20
    }),
    _ts_metadata("design:type", String)
], Course.prototype, "pattern", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Course.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _typeorm.UpdateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Course.prototype, "updatedAt", void 0);
Course = _ts_decorate([
    (0, _typeorm.Entity)()
], Course);

//# sourceMappingURL=course.entity.js.map