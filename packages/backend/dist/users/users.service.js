"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersService", {
    enumerable: true,
    get: function() {
        return UsersService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _userentity = require("./user.entity");
const _crypto = require("crypto");
const _util = require("util");
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
const scrypt = (0, _util.promisify)(_crypto.scrypt);
let UsersService = class UsersService {
    async findByEmail(email) {
        return this.usersRepo.findOne({
            where: {
                email
            }
        });
    }
    async findById(id) {
        return this.usersRepo.findOne({
            where: {
                id
            }
        });
    }
    async findAll() {
        return this.usersRepo.find();
    }
    async create(params) {
        const { email, password, roles = [], teacherId = null, studentId = null } = params;
        const passwordHash = password ? await this.hashPassword(password) : await this.hashPassword(this.generateTempPassword());
        const user = this.usersRepo.create({
            email,
            passwordHash,
            roles: roles,
            teacherId,
            studentId
        });
        return this.usersRepo.save(user);
    }
    async setPassword(userId, newPassword) {
        const passwordHash = await this.hashPassword(newPassword);
        await this.usersRepo.update(userId, {
            passwordHash
        });
    }
    async update(userId, params) {
        const updates = {};
        if (params.email) updates.email = params.email;
        if (params.password) updates.passwordHash = await this.hashPassword(params.password);
        if (params.roles !== undefined) updates.roles = params.roles.map((r)=>r.toLowerCase());
        if (params.teacherId !== undefined) updates.teacherId = params.teacherId;
        if (params.studentId !== undefined) updates.studentId = params.studentId;
        await this.usersRepo.update(userId, updates);
        return this.findById(userId);
    }
    async remove(userId) {
        await this.usersRepo.delete(userId);
    }
    async verifyPassword(user, password) {
        const [salt, storedHash] = user.passwordHash.split('.');
        const hash = await scrypt(password, salt, 32);
        return storedHash === hash.toString('hex');
    }
    async hashPassword(password) {
        const salt = (0, _crypto.randomBytes)(8).toString('hex');
        const hash = await scrypt(password, salt, 32);
        return `${salt}.${hash.toString('hex')}`;
    }
    generateTempPassword() {
        return (0, _crypto.randomBytes)(9).toString('base64');
    }
    constructor(usersRepo){
        this.usersRepo = usersRepo;
    }
};
UsersService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_userentity.User)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], UsersService);

//# sourceMappingURL=users.service.js.map