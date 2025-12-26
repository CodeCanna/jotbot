import { PathLike } from "node:fs";
import { DatabaseSync } from "node:sqlite";

/**
 * Executes a callback with a database connection, handling common setup and cleanup.
 * @param dbFile Path to the database file
 * @param callback Function to execute with the database instance
 * @returns The result of the callback
 */
export function withDB<T>(dbFile: PathLike, callback: (db: DatabaseSync) => T): T {
  const db = new DatabaseSync(dbFile);
  try {
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) {
      throw new Error("Database integrity check failed!");
    }
    db.exec("PRAGMA foreign_keys = ON;");
    return callback(db);
  } finally {
    db.close();
  }
}