import * as Crypto from 'expo-crypto';
import { dbPromise } from './database';

export type CheckIn = {
  id: string;
  date: string;
  created_at: string;
  updated_at: string;
  sync_status: string;
};

export async function addCheckIn(
  date: string
): Promise<boolean> {
  const db = await dbPromise;

  const now = new Date().toISOString();
  const id = Crypto.randomUUID();

  const result = await db.runAsync(
    `INSERT OR IGNORE INTO check_ins
      (id, date, created_at, updated_at, sync_status)
     VALUES (?, ?, ?, ?, ?)`,
    [id, date, now, now, 'PENDING']
  );

  return result.changes > 0;
}

export async function getCheckIns(): Promise<CheckIn[]> {
  const db = await dbPromise;

  return db.getAllAsync<CheckIn>(
    'SELECT * FROM check_ins ORDER BY date DESC'
  );
}

export async function getCheckInCount(): Promise<number> {
  const db = await dbPromise;

  const result = await db.getFirstAsync<{
    total: number;
  }>('SELECT COUNT(*) AS total FROM check_ins');

  return result?.total ?? 0;
}