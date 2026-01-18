"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "migratePaymentsToEntity", {
    enumerable: true,
    get: function() {
        return migratePaymentsToEntity;
    }
});
const _studententity = require("../students/student.entity");
const _paymententity = require("./payment.entity");
async function migratePaymentsToEntity(dataSource) {
    const studentRepo = dataSource.getRepository(_studententity.Student);
    const paymentRepo = dataSource.getRepository(_paymententity.Payment);
    const students = await studentRepo.find();
    for (const student of students){
        // @ts-ignore: payments may still exist in DB
        const payments = student.payments || [];
        for (const p of payments){
            const payment = paymentRepo.create({
                date: p.date,
                amount: p.amount,
                comment: p.comment,
                studentId: student.id
            });
            await paymentRepo.save(payment);
        }
    }
    console.log('Payments migrated to Payment entity.');
} // Usage example (run in a script):
 // import { AppDataSource } from '../data-source';
 // AppDataSource.initialize().then(() => migratePaymentsToEntity(AppDataSource));

//# sourceMappingURL=migrate-payments.js.map