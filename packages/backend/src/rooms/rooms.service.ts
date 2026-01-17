import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
  }

  async findOne(id: number): Promise<Room> {
    return await this.roomRepository.findOne({ where: { id } });
  }

  async create(createDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(createDto);
    return await this.roomRepository.save(room);
  }

  async update(id: number, updateDto: UpdateRoomDto): Promise<Room> {
    await this.roomRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.roomRepository.delete(id);
  }
  async batchUpsert(
    rooms: CreateRoomDto[],
  ): Promise<{ created: number; updated: number; rooms: Room[] }> {
    const results: Room[] = [];
    let created = 0;
    let updated = 0;

    for (const roomDto of rooms) {
      // Find existing room by name
      const existingRoom = await this.roomRepository.findOne({
        where: { name: roomDto.name },
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

    return { created, updated, rooms: results };
  }
}
