import { JournalEntryPhoto } from "../types/types.ts";
import { PathLike } from "node:fs";
import { withDB } from "../utils/dbHelper.ts";

export function insertJournalEntryPhoto(
  jePhoto: JournalEntryPhoto,
  dbFile: PathLike,
) {
  return withDB(dbFile, (db) => {
    const queryResult = db.prepare(
      `INSERT INTO photo_db (entryId, path, caption, fileSize) VALUES (?, ?, ?, ?);`,
    ).run(
      jePhoto.journalEntryId,
      jePhoto.path,
      jePhoto.caption || null,
      jePhoto.fileSize,
    );

    if (queryResult.changes === 0) {
      throw new Error("Insert failed: no changes made");
    }

    return queryResult;
  });
}
