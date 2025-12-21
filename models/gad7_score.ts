import { DatabaseSync } from "node:sqlite";
import { GAD7Score } from "../types/types.ts";
import { PathLike } from "node:fs";

export function insertGadScore(score: GAD7Score, dbPath: PathLike) {
  let queryResult;
  try {
    const db = new DatabaseSync(dbPath);
    db.exec("PRAGMA foreign_keys = ON;");
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) {
      throw new Error("JotBot Error: Databaes integrety check failed!");
    }

    queryResult = db.prepare(
      `INSERT INTO gad_score_db (userId, timestamp, score, severity, impact) VALUES (?, ?, ?, ?, ?);`,
    ).run(
      score.userId,
      score.timestamp,
      score.score,
      score.severity,
      score.impactQuestionAnswer,
    );

    if (queryResult.changes === 0) {
      throw new Error("The query ran but no changes were detected.");
    }

    db.close();
  } catch (err) {
    console.error(`Failed to insert gad-7 score: ${err}`);
  }
  console.log(queryResult);
  return queryResult;
}

// export function updateGadScore(id: number) {
//   // TODO
// }

// export function deleteGadScore(id: number) {
//   // TODO
// }

// export function getGadScoreById(id: number) {
//   // TODO
// }

// export function getAllGadScoresByUserId(userId: number) {
//   // TODO
// }
