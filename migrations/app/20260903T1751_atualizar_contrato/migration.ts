#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/6d554349561955fb7faab530d23bf461f2bdce71f90f662cf9444f237c25700c/contract';
import startContract from '../../snapshots/6d554349561955fb7faab530d23bf461f2bdce71f90f662cf9444f237c25700c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/a84901c1c9d6d5d8400f3c1b9e0790ce37164d1e5bc6ceb04b86bb9b37cd61d3/contract';
import endContract from '../../snapshots/a84901c1c9d6d5d8400f3c1b9e0790ce37164d1e5bc6ceb04b86bb9b37cd61d3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'presenceConfirmation',
        columns: [
          col('guestId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('weddingId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['guestId', 'weddingId'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'presenceConfirmation',
        index: 'presenceConfirmation_guestId_idx_39c95865',
        columns: ['guestId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'presenceConfirmation',
        index: 'presenceConfirmation_weddingId_idx_b30e5447',
        columns: ['weddingId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'presenceConfirmation',
        foreignKey: {
          name: 'presenceConfirmation_guestId_fkey',
          columns: ['guestId'],
          references: { schema: 'public', table: 'guest', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'presenceConfirmation',
        foreignKey: {
          name: 'presenceConfirmation_weddingId_fkey',
          columns: ['weddingId'],
          references: { schema: 'public', table: 'wedding', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
