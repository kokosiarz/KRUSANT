"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BatchUpsertClassDto", {
    enumerable: true,
    get: function() {
        return BatchUpsertClassDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classtransformer = require("class-transformer");
const _classvalidator = require("class-validator");
const _createclassdto = require("./create-class.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let BatchUpsertClassDto = class BatchUpsertClassDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Array of classes to create or update',
        type: [
            _createclassdto.CreateClassDto
        ]
    }),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.ValidateNested)({
        each: true
    }),
    (0, _classtransformer.Type)(()=>_createclassdto.CreateClassDto),
    _ts_metadata("design:type", Array)
], BatchUpsertClassDto.prototype, "classes", void 0);

//# sourceMappingURL=batch-upsert-class.dto.js.map