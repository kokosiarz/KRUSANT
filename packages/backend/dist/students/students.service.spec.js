"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _studentsservice = require("./students.service");
describe('StudentsService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _studentsservice.StudentsService
            ]
        }).compile();
        service = module.get(_studentsservice.StudentsService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
});

//# sourceMappingURL=students.service.spec.js.map