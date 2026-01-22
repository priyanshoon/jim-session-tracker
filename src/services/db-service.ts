import Database from "better-sqlite3";
import type { UserInfoDTO } from "../dtos/user-info-dto.ts";

class DatabaseService {
  private db: Database.Database;

  constructor() {
    this.db = new Database("record.db", { verbose: console.log });
  }

  public initializeDB(): void {
    const tableInfo = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        createdAt TEXT,
        updatedAt TEXT
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_template(
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS workout_template_exercises(
        template_id INTEGER,
        exercise_id INTEGER,
        position INTEGER,
        PRIMARY KEY (template_id, exercise_id),
        FOREIGN KEY (template_id) REFERENCES workout_templates(id),
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      );

      CREATE TABLE IF NOT EXISTS workout_sessions(
        id INTEGER PRIMARY KEY,
        user_id INTEGER NUL NULL,
        template_id INTEGER,
        performed_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (template_id) REFERENCES workout_template(id)
      );

      CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY,
        session_id INTEGER,
        exercise_id INTEGER,
        set_number INTEGER,
        reps INTEGER,
        weight REAL,
        FOREIGN KEY (session_id) REFERENCES workout_sessions(id),
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      );
    `;
    this.db.exec(tableInfo);
  }

  public readAllUserInfo(): UserInfoDTO[] {
    const stmt = this.db.prepare(`
      SELECT id, email, createdAt, updatedAt
      FROM users;
    `);
    return stmt.all();
  }

  public readUserInfo(email: string): UserInfoDTO {
    const query = this.db.prepare(`
      SELECT id, email, createdAt, updatedAt
      FROM users
      WHERE email = ?
    `);
    return query.all(email);
  }

  public saveUserInfo(anon: UserInfoDTO): void {
    const query = this.db.prepare(
      `
        INSERT INTO
        users (email, password, createdAt, updatedAt)
        VALUES (?, ?, ?, ?);
      `,
    );
    query.run(anon.email, anon.password, anon.createdAt, anon.updatedAt);
  }

  public updateUserInfo(anon: UserInfoDTO): void {
    const query = this.db.prepare(`
      UPDATE
      users
      SET
        email = ?,
        password = ?,
        updatedAt = ?
      WHERE
        id = ?
    `);

    query.run(anon.email, anon.password, anon.updatedAt);
  }
}

export default DatabaseService;
