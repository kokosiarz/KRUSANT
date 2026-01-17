"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RoomsService", {
    enumerable: true,
    get: function() {
        return RoomsService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _typeorm1 = require("typeorm");
const _roomentity = require("./room.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let RoomsService = class RoomsService {
    async findAll() {
        return await this.roomRepository.find();
    }
    async findOne(id) {
        return await this.roomRepository.findOne({
            where: {
                id
            }
        });
    }
    async create(createDto) {
        const room = this.roomRepository.create(createDto);
        return await this.roomRepository.save(room);
    }
    async update(id, updateDto) {
        await this.roomRepository.update(id, updateDto);
        return await this.findOne(id);
    }
    async remove(id) {
        await this.roomRepository.delete(id);
    }
    async batchUpsert(rooms) {
        const results = [];
        let created = 0;
        let updated = 0;
        for (const roomDto of rooms){
            // Find existing room by name
            const existingRoom = await this.roomRepository.findOne({
                where: {
                    name: roomDto.name
                }
            });
            if (existingRoom) {
                // Update existing room
                await this.roomRepository.update(existingRoom.id, roomDto);
                const updatedRoom = await this.findOne(existingRoom.id);
                results.push(updatedRoom);
                updated++;
            } else {
                // Create new room
                const newRoom = this.roomRepository.create(roomDto);
                const savedRoom = await this.roomRepository.save(newRoom);
                results.push(savedRoom);
                created++;
            }
        }
        return {
            created,
            updated,
            rooms: results
        };
    }
    constructor(roomRepository){
        this.roomRepository = roomRepository;
    }
};
RoomsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_roomentity.Room)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], RoomsService);

//# sourceMappingURL=rooms.service.js.map