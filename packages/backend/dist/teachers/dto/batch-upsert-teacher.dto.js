"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BatchUpsertTeacherDto", {
    enumerable: true,
    get: function() {
        return BatchUpsertTeacherDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
const _createteacherdto = require("./create-teacher.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BatchUpsertTeacherDto = class BatchUpsertTeacherDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Array of teachers to create or update',
        type: [
            _createteacherdto.CreateTeacherDto
        ]
    }),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>_createteacherdto.CreateTeacherDto),
    _ts_metadata("design:type", Array)
], BatchUpsertTeacherDto.prototype, "teachers", void 0);

//# sourceMappingURL=batch-upsert-teacher.dto.js.map