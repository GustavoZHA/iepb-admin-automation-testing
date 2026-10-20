import { test as baseTest, expect } from '@playwright/test';
import { dbClient, DbClient } from '../db/dbClient';
import { ApiClient } from '../api/apiClient';
import { LookupsClient } from '../api/clients/lookupsClient';

export type CustomFixtures = {
  db: DbClient;
  api: ApiClient;
  lookupsApi: LookupsClient;
};

export const test = baseTest.extend<CustomFixtures>({
  db: async ({}, use, testInfo) => {
    // Provide the SQL Server database client bound to the current test context
    dbClient.setTestInfo(testInfo);
    await use(dbClient);
  },
  api: async ({ request }, use, testInfo) => {
    // Provide the centralized HTTP API client with structured logging and reporting attachments
    const apiClient = new ApiClient(request, testInfo);
    await use(apiClient);
  },
  lookupsApi: async ({ api }, use) => {
    // Provide the domain-specific Lookups API Client
    const lookupsClient = new LookupsClient(api);
    await use(lookupsClient);
  },
});

export { expect };
