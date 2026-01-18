"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TeachersModule", {
    enumerable: true,
    get: function() {
        return TeachersModule;
    }
});
const _common = require("@nestjs/common");
const _teacherscontroller = require("./teachers.controller");
const _teachersservice = require("./teachers.service");
const _teacherentity = require("./entities/teacher.entity");
const _typeorm = require("@nestjs/typeorm");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let TeachersModule = class TeachersModule {
};
TeachersModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _teacherentity.Teacher
            ])
        ],
        controllers: [
            _teacherscontroller.TeachersController
        ],
        providers: [
            _teachersservice.TeachersService
        ],
        exports: [
            _teachersservice.TeachersService
        ]
    })
], TeachersModule);

//# sourceMappingURL=teachers.module.js.map