"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DebitsController", {
    enumerable: true,
    get: function() {
        return DebitsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _debitsservice = require("./debits.service");
const _debitentity = require("./debit.entity");
const _createdebitdto = require("./dto/create-debit.dto");
const _updatedebitdto = require("./dto/update-debit.dto");
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
let DebitsController = class DebitsController {
    create(debitData) {
        return this.debitsService.create(debitData);
    }
    findAll() {
        return this.debitsService.findAll();
    }
    findOne(id) {
        return this.debitsService.findOne(Number(id));
    }
    update(id, updateData) {
        return this.debitsService.update(Number(id), updateData);
    }
    remove(id) {
        return this.debitsService.remove(Number(id));
    }
    constructor(debitsService){
        this.debitsService = debitsService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new debit'
    }),
    (0, _swagger.ApiBody)({
        type: _createdebitdto.CreateDebitDto
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Debit created',
        type: _debitentity.Debit
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createdebitdto.CreateDebitDto === "undefined" ? Object : _createdebitdto.CreateDebitDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DebitsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get all debits'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'List of debits',
        type: [
            _debitentity.Debit
        ]
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], DebitsController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get debit by id'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        type: Number
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Debit found',
        type: _debitentity.Debit
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], DebitsController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Update debit by id'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        type: Number
    }),
    (0, _swagger.ApiBody)({
        type: _updatedebitdto.UpdateDebitDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Debit updated',
        type: _debitentity.Debit
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number,
        typeof _updatedebitdto.UpdateDebitDto === "undefined" ? Object : _updatedebitdto.UpdateDebitDto
    ]),
    _ts_metadata("design:returntype", void 0)
], DebitsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Delete debit by id'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        type: Number
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Debit deleted'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], DebitsController.prototype, "remove", null);
DebitsController = _ts_decorate([
    (0, _swagger.ApiTags)('debits'),
    (0, _common.Controller)('debits'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _debitsservice.DebitsService === "undefined" ? Object : _debitsservice.DebitsService
    ])
], DebitsController);

//# sourceMappingURL=debits.controller.js.map