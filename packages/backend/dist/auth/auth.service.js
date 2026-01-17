"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _teachersservice = require("../teachers/teachers.service");
const _jwt = require("@nestjs/jwt");
const _usersservice = require("../users/users.service");
const _rolesenum = require("./roles.enum");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AuthService = class AuthService {
    async authenticate(input) {
        // Placeholder logic for authentication
        const signIn = await this.validate(input);
        if (!signIn) {
            throw new _common.UnauthorizedException();
        }
        const accessToken = await this.getToken(signIn);
        return {
            user: {
                id: signIn.id.toString(),
                email: signIn.email,
                name: signIn.name
            },
            token: accessToken
        };
    }
    async validate(input) {
        const user = await this.usersService.findByEmail(input.email);
        if (!user) return null;
        const ok = await this.usersService.verifyPassword(user, input.password);
        if (!ok) return null;
        // Derive name: prefer teacher profile name if linked, else email
        let name = user.email;
        if (user.teacherId) {
            const teacher = await this.teachersService.findOneById(user.teacherId);
            if (teacher?.name) name = teacher.name;
        }
        return {
            id: user.id,
            email: user.email,
            name,
            roles: user.roles ?? [],
            teacherId: user.teacherId ?? null,
            studentId: user.studentId ?? null
        };
    }
    async getToken(data) {
        const payload = {
            sub: data.id,
            email: data.email,
            name: data.name,
            roles: data.roles,
            teacherId: data.teacherId,
            studentId: data.studentId
        };
        const accessToken = await this.jwtService.signAsync(payload);
        return accessToken;
    }
    async resetPassword(email, newPassword) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new _common.NotFoundException('User not found');
        }
        await this.usersService.setPassword(user.id, newPassword);
        return {
            message: 'Password reset successfully'
        };
    }
    // One-time backfill: create Users for Teachers not yet linked
    async backfillUsersFromTeachers() {
        if (process.env.ALLOW_BACKFILL !== 'true') {
            throw new _common.ForbiddenException('Backfill disabled');
        }
        const teachers = await this.teachersService.findAll();
        let created = 0;
        for (const t of teachers){
            if (!t.email) continue;
            const existing = await this.usersService.findByEmail(t.email);
            if (existing) continue;
            await this.usersService.create({
                email: t.email,
                roles: [
                    _rolesenum.Role.Teacher
                ],
                teacherId: t.id
            });
            created++;
        }
        return {
            created
        };
    }
    constructor(teachersService, usersService, jwtService){
        this.teachersService = teachersService;
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _teachersservice.TeachersService === "undefined" ? Object : _teachersservice.TeachersService,
        typeof _usersservice.UsersService === "undefined" ? Object : _usersservice.UsersService,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map