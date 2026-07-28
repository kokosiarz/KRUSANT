import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { BaseCrudService } from '../common/base-crud.service';

@Injectable()
export class RoomsService extends BaseCrudService<Room> {
  constructor(
    @InjectRepository(Room)
    roomRepository: Repository<Room>,
  ) {
    super(roomRepository, { entityName: 'Room', uniqueBy: 'name' });
  }
}
