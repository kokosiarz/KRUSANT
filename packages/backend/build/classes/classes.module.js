"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ClassesModule", {
    enumerable: true,
    get: function() {
        return ClassesModule;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _classentity = require("./class.entity");
const _classescontroller = require("./classes.controller");
const _classesservice = require("./classes.service");
const _debitsmodule = require("../debits/debits.module");
const _groupsmodule = require("../groups/groups.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ClassesModule = class ClassesModule {
};
ClassesModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _classentity.ClassEntity
            ]),
            _debitsmodule.DebitsModule,
            (0, _common.forwardRef)(()=>_groupsmodule.GroupsModule)
        ],
        controllers: [
            _classescontroller.ClassesController
        ],
        providers: [
            _classesservice.ClassesService
        ]
    })
], ClassesModule);

//# sourceMappingURL=classes.module.js.map