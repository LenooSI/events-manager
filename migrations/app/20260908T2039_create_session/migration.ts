#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/6d554349561955fb7faab530d23bf461f2bdce71f90f662cf9444f237c25700c/contract';
import startContract from '../../snapshots/6d554349561955fb7faab530d23bf461f2bdce71f90f662cf9444f237c25700c/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/c08d60a06a6b9033d85efcf78460ba5ac889e36f6bcf264b232daf41d5a34eff/contract';
import endContract from '../../snapshots/c08d60a06a6b9033d85efcf78460ba5ac889e36f6bcf264b232daf41d5a34eff/contract.json' with { type: 'json' };
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
      this.createTable({
        schema: 'public',
        table: 'session',
        columns: [
          col('expiresAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ownerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('tokenHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
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
      this.createIndex({
        schema: 'public',
        table: 'session',
        index: 'session_ownerId_idx_e2d0c1ef',
        columns: ['ownerId'],
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
      this.addForeignKey({
        schema: 'public',
        table: 'session',
        foreignKey: {
          name: 'session_ownerId_fkey',
          columns: ['ownerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
