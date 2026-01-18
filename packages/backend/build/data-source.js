"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get AppDataSource () {
        return AppDataSource;
    },
    get default () {
        return _default;
    }
});
const _typeorm = require("typeorm");
const _groupentity = require("./groups/group.entity");
const _studententity = require("./students/student.entity");
const _debitentity = require("./debits/debit.entity");
const _paymententity = require("./payments/payment.entity");
const AppDataSource = new _typeorm.DataSource({
    type: 'sqlite',
    database: '../db.sqlite',
    entities: [
        _groupentity.Group,
        _studententity.Student,
        _debitentity.Debit,
        _paymententity.Payment
    ],
    migrations: [
        'src/migrations/*.ts'
    ],
    synchronize: true
});
const _default = AppDataSource;

//# sourceMappingURL=data-source.js.map