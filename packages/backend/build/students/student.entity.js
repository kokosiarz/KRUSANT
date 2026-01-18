"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Student", {
    enumerable: true,
    get: function() {
        return Student;
    }
});
const _typeorm = require("typeorm");
const _debitentity = require("../debits/debit.entity");
const _paymententity = require("../payments/payment.entity");
const _classentity = require("../classes/class.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let Student = class Student {
};
_ts_decorate([
    (0, _typeorm.PrimaryGeneratedColumn)(),
    _ts_metadata("design:type", Number)
], Student.prototype, "id", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Student.prototype, "name", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Student.prototype, "email", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        nullable: true
    }),
    _ts_metadata("design:type", String)
], Student.prototype, "phone", void 0);
_ts_decorate([
    (0, _typeorm.OneToMany)(()=>_debitentity.Debit, (debit)=>debit.student),
    _ts_metadata("design:type", Array)
], Student.prototype, "debits", void 0);
_ts_decorate([
    (0, _typeorm.OneToMany)(()=>_paymententity.Payment, (payment)=>payment.student),
    _ts_metadata("design:type", Array)
], Student.prototype, "payments", void 0);
_ts_decorate([
    (0, _typeorm.ManyToMany)(()=>_classentity.ClassEntity, (classEntity)=>classEntity.attendedStudentsIds),
    (0, _typeorm.JoinTable)(),
    _ts_metadata("design:type", Array)
], Student.prototype, "classes", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Student.prototype, "customRate", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true
    }),
    _ts_metadata("design:type", Number)
], Student.prototype, "discount", void 0);
_ts_decorate([
    (0, _typeorm.Column)(),
    _ts_metadata("design:type", String)
], Student.prototype, "semester", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        type: 'text',
        default: ''
    }),
    _ts_metadata("design:type", String)
], Student.prototype, "extraNotes", void 0);
_ts_decorate([
    (0, _typeorm.Column)({
        default: true
    }),
    _ts_metadata("design:type", Boolean)
], Student.prototype, "active", void 0);
_ts_decorate([
    (0, _typeorm.CreateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Student.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _typeorm.UpdateDateColumn)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Student.prototype, "updatedAt", void 0);
Student = _ts_decorate([
    (0, _typeorm.Entity)()
], Student);

//# sourceMappingURL=student.entity.js.map