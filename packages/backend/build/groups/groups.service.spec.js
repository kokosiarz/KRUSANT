"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _groupsservice = require("./groups.service");
describe('GroupsService', ()=>{
    let service;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _groupsservice.GroupsService
            ]
        }).compile();
        service = module.get(_groupsservice.GroupsService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
});

//# sourceMappingURL=groups.service.spec.js.map