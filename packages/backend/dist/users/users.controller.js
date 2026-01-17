"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UsersController", {
    enumerable: true,
    get: function() {
        return UsersController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _usersservice = require("./users.service");
const _createuserdto = require("./dto/create-user.dto");
const _updateuserdto = require("./dto/update-user.dto");
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
let UsersController = class UsersController {
    async getAll() {
        return await this.usersService.findAll();
    }
    async getOne(id) {
        return await this.usersService.findById(+id);
    }
    async create(body) {
        const user = await this.usersService.create({
            email: body.email,
            password: body.password,
            roles: body.roles,
            teacherId: body.teacherId,
            studentId: body.studentId
        });
        // Don't return password hash
        const { passwordHash, ...result } = user;
        return result;
    }
    async update(id, body) {
        return await this.usersService.update(+id, body);
    }
    async delete(id) {
        await this.usersService.remove(+id);
        return {
            message: 'User deleted successfully'
        };
    }
    constructor(usersService){
        this.usersService = usersService;
    }
};
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get all users'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns all users'
    }),
    (0, _common.Get)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], UsersController.prototype, "getAll", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get user by ID'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'User ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns user'
    }),
    (0, _common.Get)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], UsersController.prototype, "getOne", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Create new user'
    }),
    (0, _swagger.ApiBody)({
        type: _createuserdto.CreateUserDto
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'User created'
    }),
    (0, _common.Post)(),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createuserdto.CreateUserDto === "undefined" ? Object : _createuserdto.CreateUserDto
    ]),
    _ts_metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Update user'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'User ID'
    }),
    (0, _swagger.ApiBody)({
        type: _updateuserdto.UpdateUserDto
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'User updated'
    }),
    (0, _common.Patch)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _updateuserdto.UpdateUserDto === "undefined" ? Object : _updateuserdto.UpdateUserDto
    ]),
    _ts_metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Delete user'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'User ID'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'User deleted'
    }),
    (0, _common.Delete)(':id'),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], UsersController.prototype, "delete", null);
UsersController = _ts_decorate([
    (0, _swagger.ApiTags)('users'),
    (0, _common.Controller)('users'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService
    ])
], UsersController);

//# sourceMappingURL=users.controller.js.map