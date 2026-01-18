"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateTeacherDto", {
    enumerable: true,
    get: function() {
        return CreateTeacherDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateTeacherDto = class CreateTeacherDto {
    logInsert() {
        console.log('Inserted teacher with name', this.name);
    }
    logUpdate() {
        console.log('Updated teacher with name', this.name);
    }
    logRemove() {
        console.log('Removed teacher with name', this.name);
    }
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Teacher name',
        example: 'John Doe'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateTeacherDto.prototype, "name", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Teacher email',
        example: 'teacher@example.com'
    }),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], CreateTeacherDto.prototype, "email", void 0);

//# sourceMappingURL=create-teacher.dto.js.map