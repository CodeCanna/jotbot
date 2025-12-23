import { DatabaseSync } from "node:sqlite";
import { GAD7Score } from "../types/types.ts";
import { PathLike } from "node:fs";
import { sqlFilePath } from "../constants/paths.ts";
import { anxietySeverityStringToEnum } from "../utils/misc.ts";

const sqlPath = `${sqlFilePath}/gad_score`;

/**
 * Insert GAD-7 score into gad_score_db table
 * @param score
 * @param dbPath
 * @returns StatementResultingChanges
 */
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
      `INSERT INTO gad_score_db (userId, timestamp, score, severity, action, impactQuestionAnswer) VALUES (?, ?, ?, ?, ?, ?);`,
    ).run(
      score.userId,
      score.timestamp,
      score.score,
      score.severity,
      score.action,
      score.impactQuestionAnswer,
    );

    if (queryResult.changes === 0) {
      throw new Error("The query ran but no changes were detected.");
    }

    db.close();
  } catch (err) {
    console.error(`Failed to insert gad-7 score: ${err}`);
    throw new Error(`Failed to insert GAD-7 score: ${err}`);
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

/**
 * 
 * @param id 
 * @param dbPath 
 * @returns 
 */
export function getGadScoreById(id: number, dbPath: PathLike): GAD7Score {
  let gadScore;
  try {
    const db = new DatabaseSync(dbPath);
    const query = Deno.readTextFileSync(`${sqlPath}/get_gad_score_by_id.sql`)
      .replace("<ID>", id.toString()).trim();
    db.exec("PRAGMA foreign_keys = ON;");
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) {
      throw new Error("JotBot Error: Databaes integrety check failed!");
    }

    gadScore = db.prepare(query).get();
    console.log(gadScore);

    db.close();
  } catch (err) {
    console.error(`Failed to insert gad-7 score: ${err}`);
    throw new Error(`Failed to insert GAD-7 score: ${err}`);
  }
  return {
    id: Number(gadScore?.id),
    userId: Number(gadScore?.userId),
    timestamp: Number(gadScore?.timestamp),
    score: Number(gadScore?.score),
    severity: anxietySeverityStringToEnum(gadScore?.severity?.toString()!),
    action: gadScore?.action?.toString()!,
    impactQuestionAnswer: gadScore?.impactQuestionAnswer?.toString()!,
  };
}

// export function getAllGadScoresByUserId(userId: number) {
//   // TODO
// }
