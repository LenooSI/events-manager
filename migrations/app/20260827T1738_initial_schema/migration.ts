#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6d554349561955fb7faab530d23bf461f2bdce71f90f662cf9444f237c25700c/contract';
import endContract from '../../snapshots/6d554349561955fb7faab530d23bf461f2bdce71f90f662cf9444f237c25700c/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/efaf220cb7b0359a62bdc316956921823ce6ea0421b9d144ee0e3ec0dcdf0b3a/contract';
import startContract from '../../snapshots/efaf220cb7b0359a62bdc316956921823ce6ea0421b9d144ee0e3ec0dcdf0b3a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'gift',
        columns: [
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('price', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('weddingId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'guest',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'order',
        columns: [
          col('amount', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('giftId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('guestEmail', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('guestId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('guestName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('message', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('paidAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-temporal@1' } }),
          col('paymentId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'guest',
        constraint: 'guest_email_key',
        columns: ['email'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'gift',
        index: 'gift_weddingId_idx_b30e5447',
        columns: ['weddingId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'order',
        index: 'order_giftId_idx_97c6d28f',
        columns: ['giftId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'order',
        index: 'order_guestId_idx_39c95865',
        columns: ['guestId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'gift',
        foreignKey: {
          name: 'gift_weddingId_fkey',
          columns: ['weddingId'],
          references: { schema: 'public', table: 'wedding', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'order',
        foreignKey: {
          name: 'order_giftId_fkey',
          columns: ['giftId'],
          references: { schema: 'public', table: 'gift', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'order',
        foreignKey: {
          name: 'order_guestId_fkey',
          columns: ['guestId'],
          references: { schema: 'public', table: 'guest', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
