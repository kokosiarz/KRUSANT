"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RoomsController", {
    enumerable: true,
    get: function() {
        return RoomsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _roomsservice = require("./rooms.service");
const _batchupsertroomdto = require("./dto/batch-upsert-room.dto");
const _createroomdto = require("./dto/create-room.dto");
const _updateroomdto = require("./dto/update-room.dto");
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
let RoomsController = class RoomsController {
    async getAll() {
        return await this.roomsService.findAll();
    }
    async getOne(id) {
        return await this.roomsService.findOne(+id);
    }
    async create(body) {
        return await this.roomsService.create(body);
    }
    async update(id, body) {
        return await this.roomsService.update(+id, body);
    }
    async delete(id) {
        await this.roomsService.remove(+id);
        return {
            message: 'Room deleted successfully'
        };
    }
    async batchUpsert(batchDto) {
        return await this.roomsService.batchUpsert(batchDto.rooms);
    }
    constructor(roomsService){
        this.roomsService = roomsService;
    }
};
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get all rooms'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns all rooms'
    }),
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], RoomsController.prototype, "getAll", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get room by ID'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Room ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns room'
    }),
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], RoomsController.prototype, "getOne", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Create new room'
    }),
    (0, _swagger.ApiBody)({
        type: _createroomdto.CreateRoomDto
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Room created'
    }),
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createroomdto.CreateRoomDto === "undefined" ? Object : _createroomdto.CreateRoomDto
    ]),
    _ts_metadata("design:returntype", Promise)
], RoomsController.prototype, "create", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Update room'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Room ID'
    }),
    (0, _swagger.ApiBody)({
        type: _updateroomdto.UpdateRoomDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Room updated'
    }),
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateroomdto.UpdateRoomDto === "undefined" ? Object : _updateroomdto.UpdateRoomDto
    ]),
    _ts_metadata("design:returntype", Promise)
], RoomsController.prototype, "update", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Delete room'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Room ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Room deleted'
    }),
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], RoomsController.prototype, "delete", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Batch create or update rooms by name'
    }),
    (0, _swagger.ApiBody)({
        type: _batchupsertroomdto.BatchUpsertRoomDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Rooms created/updated. Returns count and the processed rooms.'
    }),
    (0, _common.Post)('batch-upsert'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _batchupsertroomdto.BatchUpsertRoomDto === "undefined" ? Object : _batchupsertroomdto.BatchUpsertRoomDto
    ]),
    _ts_metadata("design:returntype", Promise)
], RoomsController.prototype, "batchUpsert", null);
RoomsController = _ts_decorate([
    (0, _swagger.ApiTags)('rooms'),
    (0, _common.Controller)('rooms'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _roomsservice.RoomsService === "undefined" ? Object : _roomsservice.RoomsService
    ])
], RoomsController);

//# sourceMappingURL=rooms.controller.js.map