import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  DeepPartial,
  FindOptionsWhere,
  In,
  QueryFailedError,
  Repository,
} from 'typeorm';

export interface BaseCrudOptions<TEntity> {
  /** Used in the NotFoundException message, e.g. "Room 4 not found". */
  entityName: string;
  /** Natural key batchUpsert matches existing rows on (e.g. 'name', 'email'). */
  uniqueBy: keyof TEntity;
}

/**
 * findAll/findOne/create/update/remove/batchUpsert for the several services
 * that were otherwise identical but for the entity and its unique key.
 * Subclasses keep any extra behaviour (see GroupsService.create, for example)
 * by overriding the relevant method and calling super where useful.
 */
export abstract class BaseCrudService<TEntity extends { id: number }> {
  constructor(
    protected readonly repository: Repository<TEntity>,
    protected readonly options: BaseCrudOptions<TEntity>,
  ) {}

  async findAll(): Promise<TEntity[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<TEntity> {
    const entity = await this.repository.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
    });
    if (!entity) {
      throw new NotFoundException(`${this.options.entityName} ${id} not found`);
    }
    return entity;
  }

  async create(dto: DeepPartial<TEntity>): Promise<TEntity> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async update(id: number, dto: DeepPartial<TEntity>): Promise<TEntity> {
    await this.repository.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        /FOREIGN KEY constraint failed/i.test(error.message)
      ) {
        throw new ConflictException(
          `Cannot delete ${this.options.entityName} ${id}: it is still referenced by other records.`,
        );
      }
      throw error;
    }
  }

  /**
   * Upserts by the configured natural key inside a single transaction, with
   * one query up front to find every existing match instead of one findOne
   * per row, and a merge+save instead of an update-then-refetch pair.
   */
  async batchUpsert(
    items: DeepPartial<TEntity>[],
  ): Promise<{ created: number; updated: number; items: TEntity[] }> {
    const uniqueBy = this.options.uniqueBy;
    return this.repository.manager.transaction(async (manager) => {
      const repo = manager.getRepository<TEntity>(this.repository.target);
      const keys = items
        .map((item) => (item as any)[uniqueBy])
        .filter((key) => key !== undefined && key !== null);
      const existing = keys.length
        ? await repo.find({
            where: { [uniqueBy]: In(keys) } as FindOptionsWhere<TEntity>,
          })
        : [];
      const existingByKey = new Map(
        existing.map((e) => [(e as any)[uniqueBy], e]),
      );

      const results: TEntity[] = [];
      let created = 0;
      let updated = 0;
      for (const item of items) {
        const key = (item as any)[uniqueBy];
        const match = key !== undefined ? existingByKey.get(key) : undefined;
        if (match) {
          const merged = repo.merge(match, item);
          results.push(await repo.save(merged));
          updated++;
        } else {
          const entity = repo.create(item);
          results.push(await repo.save(entity));
          created++;
        }
      }
      return { created, updated, items: results };
    });
  }
}
