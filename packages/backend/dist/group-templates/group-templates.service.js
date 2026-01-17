"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GroupTemplatesService", {
    enumerable: true,
    get: function() {
        return GroupTemplatesService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _grouptemplateentity = require("./group-template.entity");
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
let GroupTemplatesService = class GroupTemplatesService {
    async findAll() {
        return await this.groupTemplateRepository.find();
    }
    async findOne(id) {
        return await this.groupTemplateRepository.findOne({
            where: {
                id
            }
        });
    }
    async create(createDto) {
        const entity = this.groupTemplateRepository.create(createDto);
        return await this.groupTemplateRepository.save(entity);
    }
    async update(id, updateDto) {
        await this.groupTemplateRepository.update(id, updateDto);
        return await this.findOne(id);
    }
    async remove(id) {
        await this.groupTemplateRepository.delete(id);
    }
    constructor(groupTemplateRepository){
        this.groupTemplateRepository = groupTemplateRepository;
    }
};
GroupTemplatesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_grouptemplateentity.GroupTemplate)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], GroupTemplatesService);

//# sourceMappingURL=group-templates.service.js.map