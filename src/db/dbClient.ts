import sql from 'mssql';
import { TestInfo } from '@playwright/test';
import { env } from '../../config/env.config';
import { logger } from '../utils/logger';

export class DbClient {
  private pool: sql.ConnectionPool | null = null;
  private testInfo?: TestInfo;

  /**
   * Sets the current TestInfo context for report attachments
   */
  setTestInfo(testInfo?: TestInfo): void {
    this.testInfo = testInfo;
  }

  /**
   * Retrieves or initializes the SQL Server connection pool
   */
  async getPool(): Promise<sql.ConnectionPool> {
    if (!this.pool || !this.pool.connected) {
      try {
        logger.info(`Connecting to Microsoft SQL Server (${env.db.server}:${env.db.port}/${env.db.database})...`);
        this.pool = await new sql.ConnectionPool({
          server: env.db.server,
          port: env.db.port,
          database: env.db.database,
          user: env.db.user,
          password: env.db.password,
          options: env.db.options,
          pool: env.db.pool,
        }).connect();
        logger.info('Connected to Microsoft SQL Server successfully.');
      } catch (error) {
        logger.error(`❌ Failed to connect to Microsoft SQL Server: ${(error as Error).message}`);
        throw error;
      }
    }
    return this.pool;
  }

  /**
   * Executes a SELECT query and returns typed recordsets
   */
  async query<T = any>(queryText: string, params?: Record<string, any>): Promise<T[]> {
    logger.info(`SQL: ${queryText.trim()}`);
    if (params) {
      logger.info(`Params: ${JSON.stringify(params, null, 2)}`);
    }

    try {
      const pool = await this.getPool();
      const request = pool.request();

      if (params) {
        for (const [key, value] of Object.entries(params)) {
          request.input(key, value);
        }
      }

      const result = await request.query<T>(queryText);
      const count = result.recordset?.length ?? 0;
      logger.info(`Rows Returned: ${count}`);

      if (this.testInfo) {
        try {
          await this.testInfo.attach(`DB_QUERY_${Date.now()}`, {
            contentType: 'application/json',
            body: JSON.stringify(
              {
                query: queryText.trim(),
                params: params || {},
                rowsReturned: count,
                sampleData: result.recordset?.slice(0, 5),
              },
              null,
              2
            ),
          });
        } catch {
          // Safe guard in case testInfo is unavailable
        }
      }

      return result.recordset;
    } catch (error) {
      logger.error(`❌ DB Query Failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Executes INSERT, UPDATE, or DELETE commands and returns the total affected rows
   */
  async execute(queryText: string, params?: Record<string, any>): Promise<number> {
    logger.info(`SQL: ${queryText.trim()}`);
    if (params) {
      logger.info(`Params: ${JSON.stringify(params, null, 2)}`);
    }

    try {
      const pool = await this.getPool();
      const request = pool.request();

      if (params) {
        for (const [key, value] of Object.entries(params)) {
          request.input(key, value);
        }
      }

      const result = await request.query(queryText);
      const affected = result.rowsAffected.reduce((acc, curr) => acc + curr, 0);
      logger.info(`Rows Affected: ${affected}`);

      if (this.testInfo) {
        try {
          await this.testInfo.attach(`DB_EXECUTE_${Date.now()}`, {
            contentType: 'application/json',
            body: JSON.stringify(
              {
                query: queryText.trim(),
                params: params || {},
                rowsAffected: affected,
              },
              null,
              2
            ),
          });
        } catch {
          // Safe guard in case testInfo is unavailable
        }
      }

      return affected;
    } catch (error) {
      logger.error(`❌ DB Command Failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Closes the active connection pool
   */
  async close(): Promise<void> {
    if (this.pool && this.pool.connected) {
      await this.pool.close();
      this.pool = null;
      logger.info('Database connection pool closed.');
    }
  }
}

export const dbClient = new DbClient();
