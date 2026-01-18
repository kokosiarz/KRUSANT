"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DebitsModule", {
    enumerable: true,
    get: function() {
        return DebitsModule;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _debitentity = require("./debit.entity");
const _debitsservice = require("./debits.service");
const _debitscontroller = require("./debits.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let DebitsModule = class DebitsModule {
};
DebitsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _debitentity.Debit
            ])
        ],
        providers: [
            _debitsservice.DebitsService
        ],
        controllers: [
            _debitscontroller.DebitsController
        ],
        exports: [
            _debitsservice.DebitsService
        ]
    })
], DebitsModule);

//# sourceMappingURL=debits.module.js.map