import { test, expect } from '../../src/fixtures/testBase';
import { MemberDataReader } from '../../src/data/memberDataReader';
import { CreateMemberRequest } from '../../src/api/models/members.model';
import { ApiClient } from '../../src/api/apiClient';
import { scenarioContext } from '../../src/context/scenarioContext';
import { cleanTestMembers, deleteMemberById } from '../../src/db/helpers/memberTeardown';

test.describe('Members - Filter and Details UI Suite', { tag: ['@ui'] }, () => {
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
      genderId: 1, // Feme
      birthDate: poolData.birthDate,
      maritalStatusId: 1, // Singler
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

    await test.step('Send POST request to /api/members to pre-seed member for filter and details test', async () => {
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

  test('Filter table by member columns (name, surname, second surname, gender, age, birth date, address, marital status, conversion date, active, deleted, created at)', async ({
    membersPage,
  }) => {
    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter by first name column and verify matching record', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
    });

    await test.step('Filter by last name column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByLastName(seededMember.lastName);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });

    await test.step('Filter by second surname column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterBySurName(seededMember.surName!);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });

    await test.step('Filter by gender dropdown and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.filterByGender('Femenino');
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
      await expect(row).toContainText('Femenino');
    });

    await test.step('Filter by birth date column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      const birthYear = seededMember.birthDate!.split('-')[0];
      await membersPage.filterByBirthDate(birthYear);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });

    await test.step('Filter by age column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.filterByAge('>18');
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });

    await test.step('Filter by address column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByAddress(seededMember.homeAddress!);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });

    await test.step('Filter by marital status column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.filterByMaritalStatus('Soltero');
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
      await expect(row).toContainText('Soltero');
    });

    await test.step('Filter by conversion date column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      const convYear = seededMember.conversionDate!.split('-')[0];
      await membersPage.filterByConversionDate(convYear);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });

    await test.step('Filter by active status column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.filterByIsActive('Sí');
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });

    await test.step('Filter by deleted status column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.filterByIsDeleted('No');
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });

    await test.step('Filter by created date column and verify matching record', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      const currentYear = new Date().getFullYear().toString();
      await membersPage.filterByCreatedAt(currentYear);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible();
    });

    await test.step('Click "Quitar filtros" button to reset all filters', async () => {
      await membersPage.clearAllFilters();
    });
  });

  test('View member details in detail modal', async ({
    membersPage,
    memberDetailModal,
  }) => {
    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Ver Detalle" button to open detail modal', async () => {
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify member detail information matches seeded pool data', async () => {
      const fullName = await memberDetailModal.getFullName();
      expect(fullName).toContain(seededMember.firstName);
      expect(fullName).toContain(seededMember.lastName);

      if (seededMemberId) {
        const displayedId = await memberDetailModal.getMemberId();
        expect(displayedId.toLowerCase()).toBe(seededMemberId.toLowerCase());
      }
    });

    await test.step('Close member detail modal', async () => {
      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });
});
