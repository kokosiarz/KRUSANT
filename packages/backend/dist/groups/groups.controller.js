"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GroupsController", {
    enumerable: true,
    get: function() {
        return GroupsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _groupsservice = require("./groups.service");
const _batchupsertgroupdto = require("./dto/batch-upsert-group.dto");
const _creategroupdto = require("./dto/create-group.dto");
const _updategroupdto = require("./dto/update-group.dto");
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
let GroupsController = class GroupsController {
    async getAll(isActive) {
        const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return await this.groupsService.findAll(active);
    }
    async getOne(id) {
        return await this.groupsService.findOne(+id);
    }
    async create(group) {
        return await this.groupsService.create(group);
    }
    async update(id, group) {
        return await this.groupsService.update(+id, group);
    }
    async deleteGroup(id) {
        await this.groupsService.remove(+id);
        return {
            message: 'Group deleted successfully'
        };
    }
    async batchUpsert(batchDto) {
        return await this.groupsService.batchUpsert(batchDto.groups);
    }
    constructor(groupsService){
        this.groupsService = groupsService;
    }
};
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get all groups'
    }),
    (0, _swagger.ApiQuery)({
        name: 'isActive',
        required: false,
        enum: [
            'true',
            'false'
        ],
        description: 'Filter by active status'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns all groups or filtered by active status'
    }),
    (0, _common.Get)(),
    _ts_param(0, (0, _common.Query)('isActive')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupsController.prototype, "getAll", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get group by ID'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Group ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns group'
    }),
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupsController.prototype, "getOne", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Create new group'
    }),
    (0, _swagger.ApiBody)({
        type: _creategroupdto.CreateGroupDto
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Group created'
    }),
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _creategroupdto.CreateGroupDto === "undefined" ? Object : _creategroupdto.CreateGroupDto
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupsController.prototype, "create", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Update group'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Group ID'
    }),
    (0, _swagger.ApiBody)({
        type: _updategroupdto.UpdateGroupDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Group updated'
    }),
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updategroupdto.UpdateGroupDto === "undefined" ? Object : _updategroupdto.UpdateGroupDto
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupsController.prototype, "update", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Delete group'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Group ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Group deleted'
    }),
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupsController.prototype, "deleteGroup", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Batch create or update groups by name'
    }),
    (0, _swagger.ApiBody)({
        type: _batchupsertgroupdto.BatchUpsertGroupDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Groups created/updated. Returns count and the processed groups.'
    }),
    (0, _common.Post)('batch-upsert'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _batchupsertgroupdto.BatchUpsertGroupDto === "undefined" ? Object : _batchupsertgroupdto.BatchUpsertGroupDto
    ]),
    _ts_metadata("design:returntype", Promise)
], GroupsController.prototype, "batchUpsert", null);
GroupsController = _ts_decorate([
    (0, _swagger.ApiTags)('groups'),
    (0, _common.Controller)('groups'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _groupsservice.GroupsService === "undefined" ? Object : _groupsservice.GroupsService
    ])
], GroupsController);

//# sourceMappingURL=groups.controller.js.map