"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _teacherscontroller = require("./teachers.controller");
describe('TeachersController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _teacherscontroller.TeachersController
            ]
        }).compile();
        controller = module.get(_teacherscontroller.TeachersController);
    });
    it('should be defined', ()=>{
        expect(controller).toBeDefined();
    });
});

//# sourceMappingURL=teachers.controller.spec.js.map