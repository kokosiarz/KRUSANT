"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthModule", {
    enumerable: true,
    get: function() {
        return AuthModule;
    }
});
const _common = require("@nestjs/common");
const _passportauthcontroller = require("./passport-auth.controller");
const _authservice = require("./auth.service");
const _teachersmodule = require("../teachers/teachers.module");
const _usersmodule = require("../users/users.module");
const _dotenv = require("dotenv");
const _jwt = require("@nestjs/jwt");
const _passport = require("@nestjs/passport");
const _jwtstrategy = require("./strategies/jwt.strategy");
const _localstrategy = require("./strategies/local.strategy");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
(0, _dotenv.config)();
let AuthModule = class AuthModule {
};
AuthModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _passportauthcontroller.PassportAuthController
        ],
        providers: [
            _authservice.AuthService,
            _jwtstrategy.JwtStrategy,
            _localstrategy.LocalStrategy
        ],
        imports: [
            _teachersmodule.TeachersModule,
            _usersmodule.UsersModule,
            _jwt.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: '3d'
                }
            }),
            _passport.PassportModule
        ]
    })
], AuthModule);

//# sourceMappingURL=auth.module.js.map