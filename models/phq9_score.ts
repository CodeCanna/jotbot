import { PathLike } from "node:fs";
import { PHQ9Score } from "../types/types.ts";
import { DatabaseSync } from "node:sqlite";
import { depressionSeverityStringToEnum } from "../utils/misc.ts";

/**
 * @param phqScore
 * @param dbFile
 * @returns
 */
export function insertPhqScore(phqScore: PHQ9Score, dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);

    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const queryResult = db.prepare(
      `INSERT INTO phq_score_db (userId, timestamp, score, severity, action, impact) VALUES (?, ?, ?, ?, ?, ?);`,
    ).run(
      phqScore.userId,
      phqScore.timestamp,
      phqScore.score,
      phqScore.severity.toString(),
      phqScore.action,
      phqScore.impactQuestionAnswer,
    );

    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to save PHQ-9 score: ${err}`);
    throw err;
  }
}

/**
 * @param userId
 * @param dbFile
 * @returns
 */
export function getPhqScoreByUserId(userId: number, dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const phqScore = db.prepare(
      `SELECT * FROM phq_score_db WHERE userId = ${userId};`,
    ).get();
    return {
      id: Number(phqScore?.id!),
      userId: Number(phqScore?.userId!),
      timestamp: Number(phqScore?.timestamp!),
      score: Number(phqScore?.score!),
      severity: depressionSeverityStringToEnum(String(phqScore?.severity!)),
      action: String(phqScore?.action!),
      impactQuestionAnswer: String(phqScore?.impact!),
    };
  } catch (err) {
    console.error(`Failed to retrieve user ${userId} PHQ-9 score: ${err}`);
  }
}

export function getPhqScoreById(id: number, dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    if (
      !(db.prepare("PRAGMA integrity_check;").get()?.integrity_check === "ok")
    ) throw new Error("JotBot Error: Databaes integrety check failed!");
    db.exec("PRAGMA foreign_keys = ON;");

    const phqScore = db.prepare(
      `SELECT * FROM phq_score_db WHERE id = ${id};`,
    ).get();
    return {
      id: Number(phqScore?.id!),
      userId: Number(phqScore?.userId!),
      timestamp: Number(phqScore?.timestamp!),
      score: Number(phqScore?.score!),
      severity: depressionSeverityStringToEnum(String(phqScore?.severity!)),
      action: String(phqScore?.action!),
      impactQuestionAnswer: String(phqScore?.impact!),
    };
  } catch (err) {
    console.error(`Failed to retrieve PHQ-9 score ${id}: ${err}`);
  }
}
