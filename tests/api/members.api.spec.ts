import { test, expect } from '../../src/fixtures/testBase';
import { apiMemberResponseSchema, apiErrorResponseSchema } from '../../src/api/schemas/members.schema';
import {
  buildMemberPayload,
  buildMinimalMemberPayload,
  buildRandomMemberPayload,
} from '../../src/api/builders/memberBuilder';
import { cleanTestMembers, deleteMemberById } from '../../src/db/helpers/memberTeardown';
import { ApiClient } from '../../src/api/apiClient';
import { scenarioContext } from '../../src/context/scenarioContext';

test.describe('Members API Suite', { tag: ['@api'] }, () => {
  const createdMemberIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    await test.step('Send GET requests to load catalog lookups using ApiClient and verify 200 OK', async () => {
      const apiClient = new ApiClient(request);
      await scenarioContext.loadFromApiClient(apiClient);
    });
  });

  test.afterAll(async ({ db }) => {
    await test.step('DB - Delete all created test members by ID', async () => {
      for (const id of createdMemberIds) {
        await deleteMemberById(db, id);
      }
    });

    await test.step('DB - Clean up test members matching TEST_AUT_ or TEST_AT_ prefix', async () => {
      await cleanTestMembers(db, 'TEST_AUT_');
    });

    await test.step('DB - Close SQL Server connection pool', async () => {
      await db.close();
    });
  });

  test('Create a new member with full personal and spiritual data', async ({ membersApi, db }) => {
    // Build payload using Partial<CreateMemberRequest> factory
    const payload = buildMemberPayload();

    let createResponse: any;
    let createResponseBody: any;
    let memberId: string = '';

    await test.step('Send POST request to /api/members with full payload', async () => {
      createResponse = await membersApi.create(payload);
    });

    await test.step('Verify HTTP 201 Created status code', async () => {
      expect(createResponse.status()).toBe(201);
    });

    await test.step('Validate JSON response schema with Zod', async () => {
      createResponseBody = await createResponse.json();
      const validation = apiMemberResponseSchema.safeParse(createResponseBody);
      expect(validation.success).toBe(true);
      expect(createResponseBody.success).toBe(true);
      expect(createResponseBody.data).toBeDefined();

      memberId = createResponseBody.data.id;
      createdMemberIds.push(memberId);
      expect(createResponseBody.data.firstName).toBe(payload.firstName);
    });

    await test.step(`Send GET request to /api/members/${memberId} to verify member details`, async () => {
      const getByIdRes = await membersApi.getById(memberId);
      expect(getByIdRes.status()).toBe(200);

      const getByIdBody = await getByIdRes.json();
      expect(getByIdBody.success).toBe(true);
      expect(getByIdBody.data.id).toBe(memberId);
      expect(getByIdBody.data.firstName).toBe(payload.firstName);
      expect(getByIdBody.data.lastName).toBe(payload.lastName);
      expect(getByIdBody.data.emailAddress).toBe(payload.emailAddress);
    });

    await test.step('Send GET request to /api/members to verify member exists in all members list', async () => {
      const getAllRes = await membersApi.getAll();
      expect(getAllRes.status()).toBe(200);

      const getAllBody = await getAllRes.json();
      const membersList = getAllBody.items || getAllBody.data || [];
      const found = membersList.some((m: any) => m.id === memberId);
      expect(found).toBe(true);
    });

    await test.step('DB - Verify member record is persisted in Members table', async () => {
      const dbRecords = await db.query<{ Id: string; FirstName: string; EmailAddress: string }>(
        `SELECT Id, FirstName, EmailAddress FROM Members WHERE Id = '${memberId}'`
      );
      expect(dbRecords.length).toBe(1);
      expect(dbRecords[0].FirstName).toBe(payload.firstName);
      expect(dbRecords[0].EmailAddress).toBe(payload.emailAddress);
    });
  });

  test('Create a member using randomized pool data and chronological dates', async ({ membersApi, db }) => {
    // Generate payload from random pool
    const payload = buildRandomMemberPayload();

    let createResponse: any;
    let createResponseBody: any;
    let memberId: string = '';

    await test.step('Send POST request to /api/members with randomized pool payload', async () => {
      createResponse = await membersApi.create(payload);
    });

    await test.step('Verify HTTP 201 Created status code', async () => {
      expect(createResponse.status()).toBe(201);
    });

    await test.step('Validate JSON response schema with Zod', async () => {
      createResponseBody = await createResponse.json();
      const validation = apiMemberResponseSchema.safeParse(createResponseBody);
      expect(validation.success).toBe(true);
      expect(createResponseBody.success).toBe(true);
      expect(createResponseBody.data).toBeDefined();

      memberId = createResponseBody.data.id;
      createdMemberIds.push(memberId);
      expect(createResponseBody.data.firstName).toBe(payload.firstName);
      expect(createResponseBody.data.lastName).toBe(payload.lastName);
      expect(createResponseBody.data.surName).toBe(payload.surName);
      expect(createResponseBody.data.emailAddress).toBe(payload.emailAddress);
    });

    await test.step('DB - Verify randomized member record is persisted in Members table', async () => {
      const dbRecords = await db.query<{ Id: string; FirstName: string; EmailAddress: string }>(
        `SELECT Id, FirstName, EmailAddress FROM Members WHERE Id = '${memberId}'`
      );
      expect(dbRecords.length).toBe(1);
      expect(dbRecords[0].FirstName).toBe(payload.firstName);
      expect(dbRecords[0].EmailAddress).toBe(payload.emailAddress);
    });
  });

  test('Create a new member with minimal required fields', async ({ membersApi }) => {
    // Build minimal payload using Partial<CreateMemberRequest> factory
    const payload = buildMinimalMemberPayload();

    let createResponse: any;
    let createResponseBody: any;
    let memberId: string = '';

    await test.step('Send POST request to /api/members with minimal fields', async () => {
      createResponse = await membersApi.create(payload);
    });

    await test.step('Verify HTTP 201 Created status code', async () => {
      expect(createResponse.status()).toBe(201);
    });

    await test.step('Validate JSON response schema with Zod', async () => {
      createResponseBody = await createResponse.json();
      const validation = apiMemberResponseSchema.safeParse(createResponseBody);
      expect(validation.success).toBe(true);
      expect(createResponseBody.success).toBe(true);

      memberId = createResponseBody.data.id;
      createdMemberIds.push(memberId);
      expect(createResponseBody.data.firstName).toBe(payload.firstName);
    });

    await test.step(`Send GET request to /api/members/${memberId} to verify minimal member details`, async () => {
      const getByIdRes = await membersApi.getById(memberId);
      expect(getByIdRes.status()).toBe(200);

      const getByIdBody = await getByIdRes.json();
      expect(getByIdBody.data.id).toBe(memberId);
      expect(getByIdBody.data.firstName).toBe(payload.firstName);
      expect(getByIdBody.data.lastName).toBe(payload.lastName);
    });

    await test.step('Send GET request to /api/members to verify minimal member exists in all members list', async () => {
      const getAllRes = await membersApi.getAll();
      expect(getAllRes.status()).toBe(200);

      const getAllBody = await getAllRes.json();
      const membersList = getAllBody.items || getAllBody.data || [];
      const found = membersList.some((m: any) => m.id === memberId);
      expect(found).toBe(true);
    });
  });

  test('Reject member creation when FirstName is empty', async ({ membersApi }) => {
    // Build invalid payload using Partial<CreateMemberRequest> override
    const payload = buildMemberPayload({ firstName: '' });

    let response: any;

    await test.step('Send POST request to /api/members with missing first name', async () => {
      response = await membersApi.create(payload);
    });

    await test.step('Verify HTTP 400 Bad Request status code', async () => {
      expect(response.status()).toBe(400);
    });

    await test.step('Validate validation error structure in response', async () => {
      const responseBody = await response.json();
      const validation = apiErrorResponseSchema.safeParse(responseBody);
      expect(validation.success).toBe(true);
      expect(responseBody.success).toBe(false);
      expect(responseBody.errors).toBeDefined();
      expect(responseBody.errors.length).toBeGreaterThan(0);
    });
  });

  test('Reject member creation when LastName is empty', async ({ membersApi }) => {
    // Build invalid payload using Partial<CreateMemberRequest> override
    const payload = buildMemberPayload({ lastName: '' });

    let response: any;

    await test.step('Send POST request to /api/members with missing last name', async () => {
      response = await membersApi.create(payload);
    });

    await test.step('Verify HTTP 400 Bad Request status code', async () => {
      expect(response.status()).toBe(400);
    });

    await test.step('Validate validation error structure in response', async () => {
      const responseBody = await response.json();
      const validation = apiErrorResponseSchema.safeParse(responseBody);
      expect(validation.success).toBe(true);
      expect(responseBody.success).toBe(false);
      expect(responseBody.errors).toBeDefined();
      expect(responseBody.errors.length).toBeGreaterThan(0);
    });
  });

  test('Retrieve an existing member by ID', async ({ membersApi }) => {
    // 1. Create a member first using Partial factory
    const createPayload = buildMemberPayload();
    const createRes = await membersApi.create(createPayload);
    const created = await createRes.json();
    const memberId = created.data.id;
    createdMemberIds.push(memberId);

    // 2. Retrieve by ID
    let response: any;

    await test.step(`Send GET request to /api/members/${memberId}`, async () => {
      response = await membersApi.getById(memberId);
    });

    await test.step('Verify HTTP 200 OK status code', async () => {
      expect(response.status()).toBe(200);
    });

    await test.step('Validate retrieved member details match created record', async () => {
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(memberId);
      expect(body.data.firstName).toBe(createPayload.firstName);
      expect(body.data.lastName).toBe(createPayload.lastName);
      expect(body.data.emailAddress).toBe(createPayload.emailAddress);
    });
  });

  test('Return 404 Not Found when retrieving non-existent member ID', async ({ membersApi }) => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    let response: any;

    await test.step(`Send GET request to /api/members/${nonExistentId}`, async () => {
      response = await membersApi.getById(nonExistentId);
    });

    await test.step('Verify HTTP 404 Not Found status code', async () => {
      expect(response.status()).toBe(404);
    });
  });

  test('Search and filter members with pagination', async ({ membersApi }) => {
    const searchPayload = {
      pageNumber: 1,
      pageSize: 5,
      filters: [],
      sorts: [],
    };

    let response: any;

    await test.step('Send POST request to /api/members/search', async () => {
      response = await membersApi.search(searchPayload);
    });

    await test.step('Verify HTTP 200 OK status code', async () => {
      expect(response.status()).toBe(200);
    });

    await test.step('Validate search pagination metadata and data structure', async () => {
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toBeDefined();
      expect(body.pagination.currentPage).toBe(1);
      expect(body.pagination.pageSize).toBe(5);
    });
  });

  test('Delete an existing member by ID', async ({ membersApi, db }) => {
    // 1. Create member to delete using Partial factory
    const payload = buildMinimalMemberPayload();
    const createRes = await membersApi.create(payload);
    const created = await createRes.json();
    const memberId = created.data.id;
    createdMemberIds.push(memberId);

    let deleteResponse: any;

    await test.step(`Send DELETE request to /api/members/${memberId}`, async () => {
      deleteResponse = await membersApi.delete(memberId);
    });

    await test.step('Verify HTTP 200 OK status code', async () => {
      expect(deleteResponse.status()).toBe(200);
    });

    await test.step(`Send GET request to /api/members/${memberId} to verify deletion status`, async () => {
      const getRes = await membersApi.getById(memberId);
      expect(getRes.status()).toBe(404);
    });

    await test.step('Send GET request to /api/members to verify member list reflects deletion', async () => {
      const getAllRes = await membersApi.getAll();
      expect(getAllRes.status()).toBe(200);

      const getAllBody = await getAllRes.json();
      const membersList = getAllBody.items || getAllBody.data || [];
      const foundInActiveList = membersList.some((m: any) => m.id === memberId && !m.isDeleted);
      expect(foundInActiveList).toBe(false);
    });

    await test.step('DB - Verify member deletion status in database', async () => {
      const dbRecords = await db.query<{ ID: string }>(
        `SELECT ID FROM Members WHERE ID = '${memberId}'`
      );
      expect(dbRecords.length).toBe(0);
    });
  });

  test('Retrieve member lookup catalogs (genders and relationship types)', async ({ membersApi }) => {
    let genderRes: any;
    let relationshipRes: any;

    await test.step('Send GET request to /api/members/lookups/genders', async () => {
      genderRes = await membersApi.getGenders();
    });

    await test.step('Verify HTTP 200 OK for genders lookup', async () => {
      expect(genderRes.status()).toBe(200);
      const data = await genderRes.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    await test.step('Send GET request to /api/members/lookups/relationship-types', async () => {
      relationshipRes = await membersApi.getRelationshipTypes();
    });

    await test.step('Verify HTTP 200 OK for relationship-types lookup', async () => {
      expect(relationshipRes.status()).toBe(200);
      const data = await relationshipRes.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });
});
