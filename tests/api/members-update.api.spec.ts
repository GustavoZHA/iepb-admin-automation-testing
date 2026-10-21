import { test, expect } from '../../src/fixtures/testBase';
import { apiMemberResponseSchema } from '../../src/api/schemas/members.schema';
import {
  buildMemberPayload,
  buildMemberUpdatePayload,
  buildRandomMemberUpdatePayload,
} from '../../src/api/builders/memberBuilder';
import { cleanTestMembers, deleteMemberById } from '../../src/db/helpers/memberTeardown';
import { ApiClient } from '../../src/api/apiClient';
import { MembersClient } from '../../src/api/clients/membersClient';
import { scenarioContext } from '../../src/context/scenarioContext';
import { MemberDataReader } from '../../src/data/memberDataReader';

test.describe('Members Update API Suite', { tag: ['@api'] }, () => {
  const createdMemberIds: string[] = [];
  let baseMemberId: string = '';
  let initialMemberData: any;

  test.beforeAll(async ({ request }) => {

    const apiClient = new ApiClient(request);
    await test.step('Send GET requests to load catalog lookups using ApiClient and verify 200 OK', async () => {
      await scenarioContext.loadFromApiClient(apiClient);
    });

    await test.step('Send POST request to /api/members to pre-create member for update suite', async () => {
      const membersClient = new MembersClient(apiClient);
      initialMemberData = buildMemberPayload();
      const createResponse = await membersClient.create(initialMemberData);
      expect(createResponse.status()).toBe(201);

      const body = await createResponse.json();
      baseMemberId = body.data.id;
      createdMemberIds.push(baseMemberId);
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

  test('Update member contact and address information', async ({ membersApi, db }) => {
    const updatePayload = buildMemberUpdatePayload({
      phoneNumber: '984555123',
      homeAddress: 'Av. Las Palmeras 890, Surco, Lima',
      emergencyContact: 'Raquel Mendoza',
      emergencyPhone: '984555999',
    });

    let updateResponse: any;

    await test.step(`Send PUT request to /api/members/${baseMemberId} with updated contact details`, async () => {
      updateResponse = await membersApi.update(baseMemberId, updatePayload);
    });

    await test.step('Verify HTTP 200 OK status code', async () => {
      expect(updateResponse.status()).toBe(200);
    });

    await test.step('Validate response contains updated contact information', async () => {
      const body = await updateResponse.json();
      const validation = apiMemberResponseSchema.safeParse(body);
      expect(validation.success).toBe(true);
      expect(body.success).toBe(true);
      expect(body.data.phoneNumber).toBe(updatePayload.phoneNumber);
      expect(body.data.homeAddress).toBe(updatePayload.homeAddress);
      expect(body.data.emergencyContact).toBe(updatePayload.emergencyContact);
      expect(body.data.emergencyPhone).toBe(updatePayload.emergencyPhone);
    });

    await test.step(`Send GET request to /api/members/${baseMemberId} to verify updated contact details`, async () => {
      const getRes = await membersApi.getById(baseMemberId);
      expect(getRes.status()).toBe(200);

      const getBody = await getRes.json();
      expect(getBody.data.phoneNumber).toBe(updatePayload.phoneNumber);
      expect(getBody.data.homeAddress).toBe(updatePayload.homeAddress);
    });

    await test.step('DB - Verify updated contact fields in Members table', async () => {
      const dbRecords = await db.query<{ PhoneNumber: string; HomeAddress: string }>(
        `SELECT PhoneNumber, HomeAddress FROM Members WHERE Id = '${baseMemberId}'`
      );
      expect(dbRecords.length).toBe(1);
      expect(dbRecords[0].PhoneNumber).toBe(updatePayload.phoneNumber);
      expect(dbRecords[0].HomeAddress).toBe(updatePayload.homeAddress);
    });
  });

  test('Update occupational and educational details', async ({ membersApi, db }) => {
    const pool = MemberDataReader.getPool();
    const newOccupation = pool.occupation[Math.floor(Math.random() * pool.occupation.length)];
    const newEducationLevel = pool.educationLevel[Math.floor(Math.random() * pool.educationLevel.length)];

    const updatePayload = buildMemberUpdatePayload({
      occupation: newOccupation,
      educationLevel: newEducationLevel,
    });

    let updateResponse: any;

    await test.step(`Send PUT request to /api/members/${baseMemberId} with updated occupation and education`, async () => {
      updateResponse = await membersApi.update(baseMemberId, updatePayload);
    });

    await test.step('Verify HTTP 200 OK status code', async () => {
      expect(updateResponse.status()).toBe(200);
    });

    await test.step('Validate response contains updated occupation and education level', async () => {
      const body = await updateResponse.json();
      expect(body.success).toBe(true);
      expect(body.data.occupation).toBe(newOccupation);
      expect(body.data.educationLevel).toBe(newEducationLevel);
    });

    await test.step('DB - Verify updated occupation and education level in Members table', async () => {
      const dbRecords = await db.query<{ Occupation: string; EducationLevel: string }>(
        `SELECT Occupation, EducationLevel FROM Members WHERE Id = '${baseMemberId}'`
      );
      expect(dbRecords.length).toBe(1);
      expect(dbRecords[0].Occupation).toBe(newOccupation);
      expect(dbRecords[0].EducationLevel).toBe(newEducationLevel);
    });
  });

  test('Update spiritual journey and baptism data', async ({ membersApi }) => {
    const pool = MemberDataReader.getPool();
    const newChurch = pool.church[Math.floor(Math.random() * pool.church.length)];
    const dates = MemberDataReader.generateChronologicalDates();

    const updatePayload = buildMemberUpdatePayload({
      isConverted: true,
      conversionDate: dates.conversionDate,
      conversionChurch: newChurch,
      isBaptized: true,
      baptismDate: dates.baptismDate,
      baptismChurch: newChurch,
    });

    let updateResponse: any;

    await test.step(`Send PUT request to /api/members/${baseMemberId} with updated spiritual journey data`, async () => {
      updateResponse = await membersApi.update(baseMemberId, updatePayload);
    });

    await test.step('Verify HTTP 200 OK status code', async () => {
      expect(updateResponse.status()).toBe(200);
    });

    await test.step('Validate response contains updated spiritual journey details', async () => {
      const body = await updateResponse.json();
      expect(body.success).toBe(true);
      expect(body.data.conversionChurch).toBe(newChurch);
      expect(body.data.baptismChurch).toBe(newChurch);
      expect(body.data.isBaptized).toBe(true);
    });

    await test.step(`Send GET request to /api/members/${baseMemberId} to verify updated spiritual details`, async () => {
      const getRes = await membersApi.getById(baseMemberId);
      expect(getRes.status()).toBe(200);

      const getBody = await getRes.json();
      expect(getBody.data.conversionChurch).toBe(newChurch);
      expect(getBody.data.baptismChurch).toBe(newChurch);
    });
  });

  test('Update catalog status foreign keys (marital, membership, spiritual level)', async ({ membersApi, db }) => {
    const newMaritalStatusId = scenarioContext.getRandomMaritalStatusId();
    const newMembershipStatusId = scenarioContext.getRandomMembershipStatusId();
    const newSpiritualLevelId = scenarioContext.getRandomSpiritualLevelId();

    const updatePayload = buildMemberUpdatePayload({
      maritalStatusId: newMaritalStatusId,
      membershipStatusId: newMembershipStatusId,
      spiritualLevelId: newSpiritualLevelId,
    });

    let updateResponse: any;

    await test.step(`Send PUT request to /api/members/${baseMemberId} with updated catalog status IDs`, async () => {
      updateResponse = await membersApi.update(baseMemberId, updatePayload);
    });

    await test.step('Verify HTTP 200 OK status code', async () => {
      expect(updateResponse.status()).toBe(200);
    });

    await test.step('Validate response contains updated catalog status IDs', async () => {
      const body = await updateResponse.json();
      expect(body.success).toBe(true);
      expect(body.data.maritalStatusId).toBe(newMaritalStatusId);
      expect(body.data.membershipStatusId).toBe(newMembershipStatusId);
      expect(body.data.spiritualLevelId).toBe(newSpiritualLevelId);
    });

    await test.step('DB - Verify updated catalog status foreign keys in Members table', async () => {
      const dbRecords = await db.query<{ MaritalStatusId: number; MembershipStatusId: number; SpiritualLevelId: number }>(
        `SELECT MaritalStatusId, MembershipStatusId, SpiritualLevelId FROM Members WHERE Id = '${baseMemberId}'`
      );
      expect(dbRecords.length).toBe(1);
      expect(dbRecords[0].MaritalStatusId).toBe(newMaritalStatusId);
      expect(dbRecords[0].MembershipStatusId).toBe(newMembershipStatusId);
      expect(dbRecords[0].SpiritualLevelId).toBe(newSpiritualLevelId);
    });
  });

  test('Update personal identity names with automated test prefix', async ({ membersApi, db }) => {
    const timestamp = Date.now();
    const updatedFirstName = `Carlos TEST_AT_${timestamp}`;
    const updatedLastName = 'Castillo';
    const updatedSurName = 'Salazar';

    const updatePayload = buildMemberUpdatePayload({
      firstName: updatedFirstName,
      lastName: updatedLastName,
      surName: updatedSurName,
    });

    let updateResponse: any;

    await test.step(`Send PUT request to /api/members/${baseMemberId} with updated names`, async () => {
      updateResponse = await membersApi.update(baseMemberId, updatePayload);
    });

    await test.step('Verify HTTP 200 OK status code', async () => {
      expect(updateResponse.status()).toBe(200);
    });

    await test.step('Validate response contains updated member names', async () => {
      const body = await updateResponse.json();
      expect(body.success).toBe(true);
      expect(body.data.firstName).toBe(updatedFirstName);
      expect(body.data.lastName).toBe(updatedLastName);
      expect(body.data.surName).toBe(updatedSurName);
    });

    await test.step('DB - Verify updated name in Members table', async () => {
      const dbRecords = await db.query<{ FirstName: string; LastName: string }>(
        `SELECT FirstName, LastName FROM Members WHERE Id = '${baseMemberId}'`
      );
      expect(dbRecords.length).toBe(1);
      expect(dbRecords[0].FirstName).toBe(updatedFirstName);
      expect(dbRecords[0].LastName).toBe(updatedLastName);
    });
  });

  test('Return 404 Not Found when updating a non-existent member ID', async ({ membersApi }) => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const updatePayload = buildMemberUpdatePayload({
      phoneNumber: '999-0000',
    });

    let updateResponse: any;

    await test.step(`Send PUT request to /api/members/${nonExistentId} with update payload`, async () => {
      updateResponse = await membersApi.update(nonExistentId, updatePayload);
    });

    await test.step('Verify HTTP 404 Not Found status code', async () => {
      expect(updateResponse.status()).toBe(404);
    });
  });
});
