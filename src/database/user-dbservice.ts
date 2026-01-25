import DatabaseService from "./dbservice.ts";
import type { UserInfoDTO } from "../dtos/user-info-dto.ts";

class UserDatabaseService extends DatabaseService {
  public readAllUserInfo(): Pick<
    UserInfoDTO,
    "id" | "email" | "createdAt" | "updatedAt"
  >[] {
    const stmt = this.db.prepare(`
      SELECT id, email, createdAt, updatedAt
      FROM users;
    `);
    return stmt.all();
  }

  public readUserInfo(id: number): UserInfoDTO | null {
    const query = this.db.prepare(`
      SELECT id, email, password, createdAt, updatedAt
      FROM users
      WHERE id = ?
    `);
    const row = query.get(id);
    return row ?? null;
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

  public getUserByEmail(email: string): UserInfoDTO | null {
    const query = this.db.prepare(`
      SELECT id, email, password, createdAt, updatedAt
      FROM users
      WHERE email = ?
    `);
    const row = query.get(email);
    return row ?? null;
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

    query.run(anon.email, anon.password, anon.updatedAt, anon.id);
  }
}

export default UserDatabaseService;
