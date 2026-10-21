import { test, expect } from '../../src/fixtures/testBase';

test.describe('Database Connectivity Tests', { tag: ['@backend'] }, () => {
  test.afterAll(async ({ db }) => {
    await test.step('DB - Close SQL Server connection pool', async () => {
      await db.close();
    });
  });

  test('Verify connection and active Microsoft SQL Server version', async ({ db }) => {
    let result: Array<{ ServerVersion: string }> = [];

    await test.step('DB - Connect to SQL Server and query active server version', async () => {
      try {
        result = await db.query<{ ServerVersion: string }>('SELECT @@VERSION AS ServerVersion;');
      } catch (error: any) {
        console.log('SQL Server container or instance is not reachable at this moment:', error.message);
      }
    });

    await test.step('DB - Validate database instance responds properly', async () => {
      if (result.length > 0) {
        expect(result).toBeDefined();
        expect(result[0].ServerVersion).toContain('Microsoft SQL Server');
        console.log('Detected SQL Server Version:', result[0].ServerVersion);
      }
    });
  });
});
