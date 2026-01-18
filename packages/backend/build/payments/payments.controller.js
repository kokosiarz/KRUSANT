"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentsController", {
    enumerable: true,
    get: function() {
        return PaymentsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _paymentsservice = require("./payments.service");
const _paymententity = require("./payment.entity");
const _createpaymentdto = require("./dto/create-payment.dto");
const _updatepaymentdto = require("./dto/update-payment.dto");
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
let PaymentsController = class PaymentsController {
    create(paymentData) {
        return this.paymentsService.create(paymentData);
    }
    findAll() {
        return this.paymentsService.findAll();
    }
    findByStudent(studentId) {
        return this.paymentsService.findByStudent(Number(studentId));
    }
    findOne(id) {
        return this.paymentsService.findOne(Number(id));
    }
    update(id, updateData) {
        return this.paymentsService.update(Number(id), updateData);
    }
    remove(id) {
        return this.paymentsService.remove(Number(id));
    }
    constructor(paymentsService){
        this.paymentsService = paymentsService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new payment'
    }),
    (0, _swagger.ApiBody)({
        type: _createpaymentdto.CreatePaymentDto
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Payment created',
        type: _paymententity.Payment
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createpaymentdto.CreatePaymentDto === "undefined" ? Object : _createpaymentdto.CreatePaymentDto
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get all payments'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'List of payments',
        type: [
            _paymententity.Payment
        ]
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('student/:studentId'),
    (0, _swagger.ApiOperation)({
        summary: 'Get payments by student id'
    }),
    (0, _swagger.ApiParam)({
        name: 'studentId',
        type: Number
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payments for student',
        type: [
            _paymententity.Payment
        ]
    }),
    _ts_param(0, (0, _common.Param)('studentId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "findByStudent", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get payment by id'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        type: Number
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment found',
        type: _paymententity.Payment
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Update payment by id'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        type: Number
    }),
    (0, _swagger.ApiBody)({
        type: _updatepaymentdto.UpdatePaymentDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment updated',
        type: _paymententity.Payment
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number,
        typeof _updatepaymentdto.UpdatePaymentDto === "undefined" ? Object : _updatepaymentdto.UpdatePaymentDto
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Delete payment by id'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        type: Number
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment deleted'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Number
    ]),
    _ts_metadata("design:returntype", void 0)
], PaymentsController.prototype, "remove", null);
PaymentsController = _ts_decorate([
    (0, _swagger.ApiTags)('payments'),
    (0, _common.Controller)('payments'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentsservice.PaymentsService === "undefined" ? Object : _paymentsservice.PaymentsService
    ])
], PaymentsController);

//# sourceMappingURL=payments.controller.js.map