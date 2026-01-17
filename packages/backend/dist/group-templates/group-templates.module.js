"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GroupTemplatesModule", {
    enumerable: true,
    get: function() {
        return GroupTemplatesModule;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _grouptemplateentity = require("./group-template.entity");
const _grouptemplatesservice = require("./group-templates.service");
const _grouptemplatescontroller = require("./group-templates.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let GroupTemplatesModule = class GroupTemplatesModule {
};
GroupTemplatesModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _typeorm.TypeOrmModule.forFeature([
                _grouptemplateentity.GroupTemplate
            ])
        ],
        controllers: [
            _grouptemplatescontroller.GroupTemplatesController
        ],
        providers: [
            _grouptemplatesservice.GroupTemplatesService
        ]
    })
], GroupTemplatesModule);

//# sourceMappingURL=group-templates.module.js.map