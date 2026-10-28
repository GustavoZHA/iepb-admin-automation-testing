import { test, expect } from '../../src/fixtures/testBase';
import { MemberDataReader } from '../../src/data/memberDataReader';
import { CreateMemberRequest } from '../../src/api/models/members.model';
import { ApiClient } from '../../src/api/apiClient';
import { scenarioContext } from '../../src/context/scenarioContext';
import { cleanTestMembers, deleteMemberById } from '../../src/db/helpers/memberTeardown';

test.describe('Members - Delete UI Suite', { tag: ['@ui'] }, () => {
  const createdMemberIds: string[] = [];
  let seededMember: CreateMemberRequest;
  let seededMemberId: string = '';

  test.beforeAll(async ({ request }) => {
    const apiClient = new ApiClient(request);
    await test.step('Send GET requests to load catalog lookups using ApiClient and verify 200 OK', async () => {
      await scenarioContext.loadFromApiClient(apiClient);
    });
  });

  test.beforeEach(async ({ membersApi }) => {
    const poolData = MemberDataReader.generateRandomMember();
    const timestamp = Date.now();
    const firstName = `TEST_AUT_${poolData.firstName.split(' ')[0]}_${timestamp}`;

    seededMember = {
      firstName,
      lastName: poolData.lastName,
      surName: poolData.surName,
      genderId: poolData.genderId,
      birthDate: poolData.birthDate,
      maritalStatusId: poolData.maritalStatusId,
      emailAddress: poolData.emailAddress,
      phoneNumber: poolData.phoneNumber,
      homeAddress: poolData.homeAddress,
      occupation: poolData.occupation,
      educationLevel: poolData.educationLevel,
      isActive: true,
      isConverted: true,
      conversionDate: poolData.conversionDate,
      conversionChurch: poolData.church,
      isBaptized: true,
      baptismDate: poolData.baptismDate,
      baptismChurch: poolData.church,
      isDeleted: false,
    };

    await test.step('Send POST request to /api/members to pre-seed member for delete test', async () => {
      const response = await membersApi.create(seededMember);
      expect(response.status()).toBe(201);
      const body = await response.json();
      if (body.data?.id) {
        seededMemberId = body.data.id;
        createdMemberIds.push(seededMemberId);
      }
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      const screenshot = await page.screenshot({ fullPage: true }).catch(() => null);
      if (screenshot) {
        await testInfo.attach('failure-screenshot', {
          body: screenshot,
          contentType: 'image/png',
        });
      }
    }
  });

  test.afterAll(async ({ db }) => {
    await test.step('DB - Delete all created test members by ID', async () => {
      for (const id of createdMemberIds) {
        await deleteMemberById(db, id);
      }
    });

    await test.step('DB - Clean up test members matching TEST_AUT_ prefix', async () => {
      await cleanTestMembers(db, 'TEST_AUT_');
    });

    await test.step('DB - Close SQL Server connection pool', async () => {
      await db.close();
    });
  });

  test('Delete an existing member and confirm deletion dialog', async ({
    membersPage,
  }) => {
    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Eliminar" button and accept confirmation dialog', async () => {
      await membersPage.clickDelete(true);
    });

    await test.step('Verify deleted member is no longer visible in members table', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).not.toBeVisible({ timeout: 10000 });
    });
  });

  test('Cancel member deletion when dialog is dismissed', async ({
    membersPage,
  }) => {
    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Eliminar" button and dismiss confirmation dialog', async () => {
      await membersPage.clickDelete(false);
    });

    await test.step('Verify member remains visible in table when deletion was cancelled', async () => {
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });
  });
});
