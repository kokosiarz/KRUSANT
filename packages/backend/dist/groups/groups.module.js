"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GroupsModule", {
    enumerable: true,
    get: function() {
        return GroupsModule;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _groupentity = require("./group.entity");
const _courseentity = require("../courses/course.entity");
const _groupscontroller = require("./groups.controller");
const _groupsservice = require("./groups.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let GroupsModule = class GroupsModule {
};
GroupsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _groupentity.Group,
                _courseentity.Course
            ])
        ],
        controllers: [
            _groupscontroller.GroupsController
        ],
        providers: [
            _groupsservice.GroupsService
        ],
        exports: [
            _groupsservice.GroupsService
        ]
    })
], GroupsModule);

//# sourceMappingURL=groups.module.js.map