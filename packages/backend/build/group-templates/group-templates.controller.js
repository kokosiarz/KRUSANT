"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GroupTemplatesController", {
    enumerable: true,
    get: function() {
        return GroupTemplatesController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _grouptemplatesservice = require("./group-templates.service");
const _creategrouptemplatedto = require("./dto/create-group-template.dto");
const _updategrouptemplatedto = require("./dto/update-group-template.dto");
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
let GroupTemplatesController = class GroupTemplatesController {
    async getAll() {
        return await this.groupTemplatesService.findAll();
    }
    async getOne(id) {
        return await this.groupTemplatesService.findOne(+id);
    }
    async create(body) {
        return await this.groupTemplatesService.create(body);
    }
    async update(id, body) {
        return await this.groupTemplatesService.update(+id, body);
    }
    async delete(id) {
        await this.groupTemplatesService.remove(+id);
        return {
            message: 'Group template deleted successfully'
        };
    }
    constructor(groupTemplatesService){
        this.groupTemplatesService = groupTemplatesService;
    }
};
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get all group templates'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns all group templates'
    }),
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], GroupTemplatesController.prototype, "getAll", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get group template by ID'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Group template ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns group template'
    }),
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupTemplatesController.prototype, "getOne", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Create new group template'
    }),
    (0, _swagger.ApiBody)({
        type: _creategrouptemplatedto.CreateGroupTemplateDto
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Group template created'
    }),
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _creategrouptemplatedto.CreateGroupTemplateDto === "undefined" ? Object : _creategrouptemplatedto.CreateGroupTemplateDto
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupTemplatesController.prototype, "create", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Update group template'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Group template ID'
    }),
    (0, _swagger.ApiBody)({
        type: _updategrouptemplatedto.UpdateGroupTemplateDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Group template updated'
    }),
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updategrouptemplatedto.UpdateGroupTemplateDto === "undefined" ? Object : _updategrouptemplatedto.UpdateGroupTemplateDto
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupTemplatesController.prototype, "update", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Delete group template'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Group template ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Group template deleted'
    }),
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupTemplatesController.prototype, "delete", null);
GroupTemplatesController = _ts_decorate([
    (0, _swagger.ApiTags)('group-templates'),
    (0, _common.Controller)('group-templates'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _grouptemplatesservice.GroupTemplatesService === "undefined" ? Object : _grouptemplatesservice.GroupTemplatesService
    ])
], GroupTemplatesController);

//# sourceMappingURL=group-templates.controller.js.map