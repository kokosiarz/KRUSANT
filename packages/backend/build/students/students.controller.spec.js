"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _studentscontroller = require("./students.controller");
describe('StudentsController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _studentscontroller.StudentsController
            ]
        }).compile();
        controller = module.get(_studentscontroller.StudentsController);
    });
    it('should be defined', ()=>{
        expect(controller).toBeDefined();
    });
});

//# sourceMappingURL=students.controller.spec.js.map