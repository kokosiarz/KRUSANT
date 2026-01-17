"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SettingsController", {
    enumerable: true,
    get: function() {
        return SettingsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _settingsservice = require("./settings.service");
const _updatesettingsdto = require("./dto/update-settings.dto");
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
let SettingsController = class SettingsController {
    async get() {
        return this.service.get();
    }
    async update(dto) {
        return this.service.update(dto);
    }
    constructor(service){
        this.service = service;
    }
};
_ts_decorate([
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], SettingsController.prototype, "get", null);
_ts_decorate([
    (0, _common.Put)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _updatesettingsdto.UpdateSettingsDto === "undefined" ? Object : _updatesettingsdto.UpdateSettingsDto
    ]),
    _ts_metadata("design:returntype", Promise)
], SettingsController.prototype, "update", null);
SettingsController = _ts_decorate([
    (0, _swagger.ApiTags)('settings'),
    (0, _common.Controller)('settings'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _settingsservice.SettingsService === "undefined" ? Object : _settingsservice.SettingsService
    ])
], SettingsController);

//# sourceMappingURL=settings.controller.js.map