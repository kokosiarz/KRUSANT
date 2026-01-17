"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BatchUpsertCourseDto", {
    enumerable: true,
    get: function() {
        return BatchUpsertCourseDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
const _createcoursedto = require("./create-course.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BatchUpsertCourseDto = class BatchUpsertCourseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Array of courses to create or update',
        type: [
            _createcoursedto.CreateCourseDto
        ]
    }),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>_createcoursedto.CreateCourseDto),
    _ts_metadata("design:type", Array)
], BatchUpsertCourseDto.prototype, "courses", void 0);

//# sourceMappingURL=batch-upsert-course.dto.js.map