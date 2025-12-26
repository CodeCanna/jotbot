import { PathLike } from "node:fs";
import { PHQ9Score } from "../types/types.ts";
import { depressionSeverityStringToEnum } from "../utils/misc.ts";
import { withDB } from "../utils/dbHelper.ts";

/**
 * @param phqScore
 * @param dbFile
 * @returns
 */
export function insertPhqScore(phqScore: PHQ9Score, dbFile: PathLike) {
  return withDB(dbFile, (db) => {
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

    if (queryResult.changes === 0) {
      throw new Error("Insert failed: no changes made");
    }

    return queryResult;
  });
}

/**
 * @param userId
 * @param dbFile
 * @returns
 */
export function getPhqScoreByUserId(userId: number, dbFile: PathLike) {
  return withDB(dbFile, (db) => {
    const phqScore = db.prepare(
      `SELECT * FROM phq_score_db WHERE userId = ?;`,
    ).get(userId);
    if (!phqScore) return undefined;
    return {
      id: Number(phqScore.id),
      userId: Number(phqScore.userId),
      timestamp: Number(phqScore.timestamp),
      score: Number(phqScore.score),
      severity: depressionSeverityStringToEnum(String(phqScore.severity)),
      action: String(phqScore.action),
      impactQuestionAnswer: String(phqScore.impact),
    };
  });
}

export function getPhqScoreById(id: number, dbFile: PathLike) {
  return withDB(dbFile, (db) => {
    const phqScore = db.prepare(
      `SELECT * FROM phq_score_db WHERE id = ?;`,
    ).get(id);
    if (!phqScore) return undefined;
    return {
      id: Number(phqScore.id),
      userId: Number(phqScore.userId),
      timestamp: Number(phqScore.timestamp),
      score: Number(phqScore.score),
      severity: depressionSeverityStringToEnum(String(phqScore.severity)),
      action: String(phqScore.action),
      impactQuestionAnswer: String(phqScore.impact),
    };
  });
}
