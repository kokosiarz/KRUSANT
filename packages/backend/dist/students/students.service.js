"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "StudentsService", {
    enumerable: true,
    get: function() {
        return StudentsService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _studententity = require("./student.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let StudentsService = class StudentsService {
    async findAllWithBalance(active) {
        // Use a single query to aggregate debits and payments per student
        const qb = this.dataSource.createQueryBuilder();
        qb.select('student.id', 'id').addSelect('student.name', 'name').addSelect('student.email', 'email').addSelect('student.phone', 'phone').addSelect('student.customRate', 'customRate').addSelect('student.discount', 'discount').addSelect('student.semester', 'semester').addSelect('student.extraNotes', 'extraNotes').addSelect('student.active', 'active').addSelect('COALESCE(SUM(payment.amount), 0) - COALESCE(SUM(debit.amount), 0)', 'balance').from(_studententity.Student, 'student').leftJoin('debits', 'debit', 'debit.studentId = student.id').leftJoin('payment', 'payment', 'payment.studentId = student.id');
        if (active !== undefined) {
            qb.where('student.active = :active', {
                active
            });
        }
        qb.groupBy('student.id');
        qb.addGroupBy('student.name');
        qb.addGroupBy('student.email');
        qb.addGroupBy('student.phone');
        qb.addGroupBy('student.customRate');
        qb.addGroupBy('student.discount');
        qb.addGroupBy('student.semester');
        qb.addGroupBy('student.extraNotes');
        qb.addGroupBy('student.active');
        const result = await qb.getRawMany();
        return result;
    }
    async findAll(active) {
        if (active !== undefined) {
            return await this.studentRepository.find({
                where: {
                    active
                }
            });
        }
        return await this.studentRepository.find();
    }
    async findOne(id) {
        return await this.studentRepository.findOne({
            where: {
                id
            }
        });
    }
    async findByEmail(email) {
        return await this.studentRepository.findOne({
            where: {
                email
            }
        });
    }
    async create(createStudentDto) {
        const student = this.studentRepository.create(createStudentDto);
        return await this.studentRepository.save(student);
    }
    async update(id, updateStudentDto) {
        await this.studentRepository.update(id, updateStudentDto);
        return await this.findOne(id);
    }
    async remove(id) {
        await this.studentRepository.delete(id);
    }
    async batchUpsert(students) {
        const results = [];
        let created = 0;
        let updated = 0;
        for (const studentDto of students){
            // Find existing student by email
            const existingStudent = await this.studentRepository.findOne({
                where: {
                    email: studentDto.email
                }
            });
            if (existingStudent) {
                // Update existing student
                await this.studentRepository.update(existingStudent.id, studentDto);
                const updatedStudent = await this.findOne(existingStudent.id);
                results.push(updatedStudent);
                updated++;
            } else {
                // Create new student
                const newStudent = this.studentRepository.create(studentDto);
                const savedStudent = await this.studentRepository.save(newStudent);
                results.push(savedStudent);
                created++;
            }
        }
        return {
            created,
            updated,
            students: results
        };
    }
    constructor(studentRepository, dataSource){
        this.studentRepository = studentRepository;
        this.dataSource = dataSource;
    }
};
StudentsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_studententity.Student)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.DataSource === "undefined" ? Object : _typeorm1.DataSource
    ])
], StudentsService);

//# sourceMappingURL=students.service.js.map