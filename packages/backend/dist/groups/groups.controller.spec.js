"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _groupscontroller = require("./groups.controller");
describe('GroupsController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _groupscontroller.GroupsController
            ]
        }).compile();
        controller = module.get(_groupscontroller.GroupsController);
    });
    it('should be defined', ()=>{
        expect(controller).toBeDefined();
    });
});

//# sourceMappingURL=groups.controller.spec.js.map