"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PassportAuthController", {
    enumerable: true,
    get: function() {
        return PassportAuthController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _authservice = require("./auth.service");
const _passportjwtguard = require("./guards/passport-jwt.guard");
const _passportlocalguard = require("./guards/passport-local.guard");
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
let PassportAuthController = class PassportAuthController {
    async login(request, response) {
        const token = await this.authService.getToken(request.user);
        response.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });
        return {
            user: {
                id: request.user.id.toString(),
                email: request.user.email,
                name: request.user.name,
                roles: request.user.roles ?? [],
                teacherId: request.user.teacherId ?? null,
                studentId: request.user.studentId ?? null
            }
        };
    }
    logout(response) {
        response.clearCookie('access_token');
        return {
            message: 'Logged out successfully'
        };
    }
    getProfile(request) {
        return {
            user: {
                id: request.user.id.toString(),
                email: request.user.email,
                name: request.user.name,
                roles: request.user.roles ?? [],
                teacherId: request.user.teacherId ?? null,
                studentId: request.user.studentId ?? null
            }
        };
    }
    async backfillTeachers() {
        return this.authService.backfillUsersFromTeachers();
    }
    async resetPassword(body) {
        return this.authService.resetPassword(body.email, body.newPassword);
    }
    constructor(authService){
        this.authService = authService;
    }
};
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Login with email and password'
    }),
    (0, _swagger.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'teacher@example.com'
                },
                password: {
                    type: 'string',
                    example: 'password123'
                }
            }
        }
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Login successful. Returns user data and sets access token cookie.'
    }),
    (0, _swagger.ApiResponse)({
        status: 401,
        description: 'Unauthorized. Invalid credentials.'
    }),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _common.Post)('login'),
    (0, _common.UseGuards)(_passportlocalguard.PassportLocalGuard),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Response)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], PassportAuthController.prototype, "login", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Logout current user'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Logout successful. Clears access token cookie.'
    }),
    (0, _common.Post)('logout'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Response)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", void 0)
], PassportAuthController.prototype, "logout", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Get current user profile'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Returns current user profile.'
    }),
    (0, _swagger.ApiResponse)({
        status: 401,
        description: 'Unauthorized. Valid JWT token required.'
    }),
    (0, _common.Get)('profile'),
    (0, _common.UseGuards)(_passportjwtguard.PassportJwtAuthGuard),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", void 0)
], PassportAuthController.prototype, "getProfile", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Backfill Users from Teachers (dev only)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Backfill executed'
    }),
    (0, _common.Post)('backfill-teachers'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], PassportAuthController.prototype, "backfillTeachers", null);
_ts_decorate([
    (0, _swagger.ApiOperation)({
        summary: 'Reset user password by email'
    }),
    (0, _swagger.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'teacher@example.com'
                },
                newPassword: {
                    type: 'string',
                    example: 'newpassword123'
                }
            }
        }
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Password reset successful'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'User not found'
    }),
    (0, _common.Post)('reset-password'),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PassportAuthController.prototype, "resetPassword", null);
PassportAuthController = _ts_decorate([
    (0, _swagger.ApiTags)('auth'),
    (0, _common.Controller)('auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService
    ])
], PassportAuthController);

//# sourceMappingURL=passport-auth.controller.js.map