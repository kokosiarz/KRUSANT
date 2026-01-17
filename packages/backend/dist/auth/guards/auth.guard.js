"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthGuard", {
    enumerable: true,
    get: function() {
        return AuthGuard;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AuthGuard = class AuthGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const accessToken = request.headers['authorization']?.split(' ')[1];
        if (!accessToken) {
            throw new _common.UnauthorizedException();
        }
        try {
            const tokenPayload = await this.jwtService.verifyAsync(accessToken);
            request.user = {
                id: tokenPayload.sub,
                email: tokenPayload.email,
                roles: tokenPayload.roles ?? [],
                teacherId: tokenPayload.teacherId ?? null,
                studentId: tokenPayload.studentId ?? null
            };
            return true;
        } catch  {
            throw new _common.UnauthorizedException();
        }
    }
    constructor(jwtService){
        this.jwtService = jwtService;
    }
};
AuthGuard = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService
    ])
], AuthGuard);

//# sourceMappingURL=auth.guard.js.map