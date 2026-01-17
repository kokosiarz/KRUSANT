"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentsService", {
    enumerable: true,
    get: function() {
        return PaymentsService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _paymententity = require("./payment.entity");
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
let PaymentsService = class PaymentsService {
    async create(paymentData) {
        const payment = this.paymentsRepository.create(paymentData);
        return this.paymentsRepository.save(payment);
    }
    async findAll() {
        return this.paymentsRepository.find();
    }
    async findByStudent(studentId) {
        return this.paymentsRepository.find({
            where: {
                studentId
            }
        });
    }
    async findOne(id) {
        return this.paymentsRepository.findOneBy({
            id
        });
    }
    async update(id, updateData) {
        await this.paymentsRepository.update(id, updateData);
        return this.findOne(id);
    }
    async remove(id) {
        await this.paymentsRepository.delete(id);
    }
    constructor(paymentsRepository){
        this.paymentsRepository = paymentsRepository;
    }
};
PaymentsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_paymententity.Payment)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], PaymentsService);

//# sourceMappingURL=payments.service.js.map