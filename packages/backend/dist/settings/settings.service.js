"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SettingsService", {
    enumerable: true,
    get: function() {
        return SettingsService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _settingsentity = require("./settings.entity");
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
let SettingsService = class SettingsService {
    async get() {
        // Ensure a single settings row exists (id = 1)
        let current = await this.repo.findOne({
            where: {
                id: 1
            }
        });
        if (!current) {
            current = this.repo.create({
                id: 1,
                institutionName: 'Institution',
                currency: 'PLN'
            });
            await this.repo.save(current);
        }
        return current;
    }
    async update(dto) {
        const current = await this.get();
        Object.assign(current, dto);
        return this.repo.save(current);
    }
    constructor(repo){
        this.repo = repo;
    }
};
SettingsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_settingsentity.Settings)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], SettingsService);

//# sourceMappingURL=settings.service.js.map