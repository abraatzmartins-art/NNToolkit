// =============================================
// Authentication Functions — Turso Backend
// =============================================
import { getTursoClient, initDatabase } from './turso';
import bcrypt from 'bcryptjs';

async function ensureDb() {
  await initDatabase();
}

// ---- Types ----
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

// ---- Seed Admin ----
// Creates the first admin user if no users exist
// Call this with ADMIN_EMAIL and ADMIN_PASSWORD env vars
export async function seedAdmin(): Promise<void> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) return;

    await ensureDb();
    const client = getTursoClient();
    const existing = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [adminEmail],
    });
    if (existing.rows.length > 0) return; // Admin already exists

    const hash = await bcrypt.hash(adminPassword, 12);
    await client.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, is_active)
            VALUES (?, ?, ?, ?, 'admin', 1)`,
      args: [crypto.randomUUID(), 'Admin', adminEmail, hash],
    });
    console.log('[Auth] Admin user created');
  } catch (err) {
    console.error('[Auth] Error seeding admin:', err);
  }
}

// ---- Registration ----
export async function createRegistrationRequest(
  name: string,
  email: string,
  password: string,
  message: string = ''
): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureDb();
    const client = getTursoClient();

    // Check if user already exists
    const existingUser = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    });
    if (existingUser.rows.length > 0) {
      return { success: false, error: 'Este email já está registrado.' };
    }

    // Check if there's already a pending request
    const existingRequest = await client.execute({
      sql: "SELECT id, status FROM registration_requests WHERE email = ? AND status = 'pending'",
      args: [email],
    });
    if (existingRequest.rows.length > 0) {
      return { success: false, error: 'Já existe um pedido de cadastro pendente para este email.' };
    }

    const hash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    await client.execute({
      sql: `INSERT INTO registration_requests (id, name, email, password_hash, message)
            VALUES (?, ?, ?, ?, ?)`,
      args: [id, name, email, hash, message],
    });

    return { success: true };
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      return { success: false, error: 'Este email já está registrado ou tem um pedido pendente.' };
    }
    console.error('[Auth] createRegistrationRequest error:', err);
    return { success: false, error: 'Erro interno. Tente novamente.' };
  }
}

export async function getRegistrationRequests(
  status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending'
): Promise<RegistrationRequest[]> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const sql = status === 'all'
      ? 'SELECT * FROM registration_requests ORDER BY created_at DESC'
      : 'SELECT * FROM registration_requests WHERE status = ? ORDER BY created_at DESC';
    const args = status === 'all' ? [] : [status];
    const result = await client.execute({ sql, args });
    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      message: row.message as string,
      status: row.status as 'pending' | 'approved' | 'rejected',
      createdAt: row.created_at as string,
      reviewedAt: row.reviewed_at as string | null,
      reviewedBy: row.reviewed_by as string | null,
    }));
  } catch (err) {
    console.error('[Auth] getRegistrationRequests error:', err);
    return [];
  }
}

export async function approveRegistration(requestId: string, adminUserId: string): Promise<boolean> {
  try {
    await ensureDb();
    const client = getTursoClient();

    // Get the request
    const request = await client.execute({
      sql: 'SELECT * FROM registration_requests WHERE id = ? AND status = ?',
      args: [requestId, 'pending'],
    });
    if (request.rows.length === 0) return false;

    const row = request.rows[0];
    const userId = crypto.randomUUID();

    // Create the user
    await client.execute({
      sql: `INSERT INTO users (id, name, email, password_hash, role, is_active)
            VALUES (?, ?, ?, ?, 'user', 1)`,
      args: [userId, row.name, row.email, row.password_hash],
    });

    // Update the request status
    await client.execute({
      sql: `UPDATE registration_requests 
            SET status = 'approved', reviewed_at = datetime('now'), reviewed_by = ?
            WHERE id = ?`,
      args: [adminUserId, requestId],
    });

    return true;
  } catch (err) {
    console.error('[Auth] approveRegistration error:', err);
    return false;
  }
}

export async function rejectRegistration(requestId: string, adminUserId: string): Promise<boolean> {
  try {
    await ensureDb();
    const client = getTursoClient();

    await client.execute({
      sql: `UPDATE registration_requests 
            SET status = 'rejected', reviewed_at = datetime('now'), reviewed_by = ?
            WHERE id = ? AND status = 'pending'`,
      args: [adminUserId, requestId],
    });

    return true;
  } catch (err) {
    console.error('[Auth] rejectRegistration error:', err);
    return false;
  }
}

// ---- Login / Session ----
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  try {
    await ensureDb();
    const client = getTursoClient();

    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE email = ? AND is_active = 1',
      args: [email],
    });

    if (result.rows.length === 0) {
      return { success: false, error: 'Email ou senha incorretos.' };
    }

    const row = result.rows[0];
    const valid = await bcrypt.compare(password, row.password_hash as string);

    if (!valid) {
      return { success: false, error: 'Email ou senha incorretos.' };
    }

    // Create session
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await client.execute({
      sql: `INSERT INTO sessions (id, user_id, token, expires_at)
            VALUES (?, ?, ?, ?)`,
      args: [crypto.randomUUID(), row.id, token, expiresAt],
    });

    return {
      success: true,
      user: {
        id: row.id as string,
        name: row.name as string,
        email: row.email as string,
        role: row.role as 'admin' | 'user',
        isActive: Boolean(row.is_active),
        createdAt: row.created_at as string,
      },
      token,
    };
  } catch (err) {
    console.error('[Auth] login error:', err);
    return { success: false, error: 'Erro interno. Tente novamente.' };
  }
}

export async function getSession(token: string): Promise<(User & { sessionId: string }) | null> {
  try {
    await ensureDb();
    const client = getTursoClient();

    // Clean expired sessions
    await client.execute({
      sql: "DELETE FROM sessions WHERE expires_at < datetime('now')",
      args: [],
    });

    const result = await client.execute({
      sql: `SELECT s.id as session_id, s.user_id, u.name, u.email, u.role, u.is_active, u.created_at
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ? AND s.expires_at > datetime('now') AND u.is_active = 1`,
      args: [token],
    });

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.user_id as string,
      name: row.name as string,
      email: row.email as string,
      role: row.role as 'admin' | 'user',
      isActive: Boolean(row.is_active),
      createdAt: row.created_at as string,
      sessionId: row.session_id as string,
    };
  } catch (err) {
    console.error('[Auth] getSession error:', err);
    return null;
  }
}

export async function logout(token: string): Promise<void> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] });
  } catch (err) {
    console.error('[Auth] logout error:', err);
  }
}

// ---- User Management (Admin) ----
export async function getAllUsers(): Promise<User[]> {
  try {
    await ensureDb();
    const client = getTursoClient();
    const result = await client.execute({
      sql: 'SELECT * FROM users ORDER BY created_at DESC',
      args: [],
    });
    return result.rows.map(row => ({
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      role: row.role as 'admin' | 'user',
      isActive: Boolean(row.is_active),
      createdAt: row.created_at as string,
    }));
  } catch (err) {
    console.error('[Auth] getAllUsers error:', err);
    return [];
  }
}

export async function toggleUserActive(userId: string): Promise<boolean> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute({
      sql: 'UPDATE users SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?',
      args: [userId],
    });
    return true;
  } catch (err) {
    console.error('[Auth] toggleUserActive error:', err);
    return false;
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await ensureDb();
    const client = getTursoClient();
    await client.execute({ sql: 'DELETE FROM sessions WHERE user_id = ?', args: [userId] });
    await client.execute({ sql: 'DELETE FROM ai_searches WHERE user_id = ?', args: [userId] });
    await client.execute({ sql: 'DELETE FROM users WHERE id = ?', args: [userId] });
    return true;
  } catch (err) {
    console.error('[Auth] deleteUser error:', err);
    return false;
  }
}

// ---- Auth helper for API routes ----
export function getTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.substring(7);

  const cookie = request.headers.get('cookie');
  if (cookie) {
    const match = cookie.match(/(?:^|;\s*)session_token=([^;]*)/);
    if (match) return match[1];
  }

  return null;
}
