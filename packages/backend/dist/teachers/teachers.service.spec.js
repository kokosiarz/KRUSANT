"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _teachersservice = require("./teachers.service");
describe('TeachersService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _teachersservice.TeachersService
            ]
        }).compile();
        service = module.get(_teachersservice.TeachersService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
});

//# sourceMappingURL=teachers.service.spec.js.map