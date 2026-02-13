import Database from "better-sqlite3";

class DatabaseService {
  protected db: Database.Database;

  constructor() {
    this.db = new Database("record.db", { verbose: console.log });
  }

  [Symbol.dispose](): void {
    this.db.close();
  }

  private hasColumn(tableName: string, columnName: string): boolean {
    const rows = this.db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
    return rows.some((row) => row.name === columnName);
  }

  private ensureColumn(tableName: string, columnDefinition: string, columnName: string): void {
    if (!this.hasColumn(tableName, columnName)) {
      this.db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
    }
  }

  public initializeDB(): void {
    const tableInfo = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(name, user_id)
      );

      CREATE TABLE IF NOT EXISTS workout_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(name, user_id)
      );

      CREATE TABLE IF NOT EXISTS workout_template_exercises (
        template_id INTEGER,
        exercise_id INTEGER,
        position INTEGER,
        PRIMARY KEY (template_id, exercise_id),
        FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS workout_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        template_id INTEGER,
        performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        set_number INTEGER NOT NULL,
        reps INTEGER,
        weight REAL,
        FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
      );
    `;
    this.db.exec(tableInfo);

    this.ensureColumn("exercises", "user_id INTEGER", "user_id");
    this.ensureColumn("workout_templates", "user_id INTEGER", "user_id");

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
      CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON workout_templates(user_id);
    `);
  }
}

export default DatabaseService;
