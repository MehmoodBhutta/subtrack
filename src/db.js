// Mirrors lib/database.dart using expo-sqlite (v57 synchronous API).
import * as SQLite from 'expo-sqlite';
import { rowToSub, subToRow } from './models/sub';

const DB_NAME = 'subtrack.db';

let db;

function getDb() {
  if (db) return db;
  db = SQLite.openDatabaseSync(DB_NAME);
  db.execAsync(`PRAGMA journal_mode = WAL;`);
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      cycle INTEGER NOT NULL,
      nextRenewalDate TEXT NOT NULL,
      category INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  migrate(db);
  return db;
}

// Tiny key/value store for premium / onboarding / default-currency flags.
export async function kvGet(key) {
  const d = getDb();
  const rows = d.getAllSync(`SELECT value FROM kv WHERE key = ?;`, [key]);
  return rows.length ? rows[0].value : null;
}

export async function kvSet(key, value) {
  const d = getDb();
  d.runSync(
    `INSERT INTO kv (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value;`,
    [key, value]
  );
}

// v1 -> v2: add the per-subscription currency column (default existing rows
// to PKR). Mirrors the Drift onUpgrade block.
function migrate(d) {
  const cols = d.getAllSync(
    `SELECT name FROM pragma_table_info('subscriptions');`
  );
  const hasCurrency = cols.some((r) => r.name === 'currency');
  if (!hasCurrency) {
    d.runSync(`ALTER TABLE subscriptions ADD COLUMN currency TEXT NOT NULL DEFAULT 'PKR';`);
  }
}

export async function allSubs() {
  const d = getDb();
  const rows = d.getAllSync(
    `SELECT * FROM subscriptions ORDER BY datetime(nextRenewalDate) ASC;`
  );
  return rows.map(rowToSub);
}

export async function subById(id) {
  const d = getDb();
  const rows = d.getAllSync(`SELECT * FROM subscriptions WHERE id = ?;`, [id]);
  return rows.length ? rowToSub(rows[0]) : null;
}

export async function upsertSub(sub) {
  const d = getDb();
  const r = subToRow(sub);
  d.runSync(
    `INSERT INTO subscriptions (id, name, price, cycle, nextRenewalDate, category, currency, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, price=excluded.price, cycle=excluded.cycle,
       nextRenewalDate=excluded.nextRenewalDate, category=excluded.category,
       currency=excluded.currency, createdAt=excluded.createdAt;`,
    [r.id, r.name, r.price, r.cycle, r.nextRenewalDate, r.category, r.currency, r.createdAt]
  );
}

export async function deleteSub(id) {
  const d = getDb();
  d.runSync(`DELETE FROM subscriptions WHERE id = ?;`, [id]);
}

export async function clearAll() {
  const d = getDb();
  d.runSync(`DELETE FROM subscriptions;`);
}
