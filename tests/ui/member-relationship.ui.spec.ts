import { test, expect } from '../../src/fixtures/testBase';
import { FamilyTree } from '../../src/api/facades/membersFamilyFacade';
import { ApiClient } from '../../src/api/apiClient';
import { scenarioContext } from '../../src/context/scenarioContext';
import { cleanTestMembers, deleteMemberById } from '../../src/db/helpers/memberTeardown';
import { calculateAge } from '../../src/utils/dateUtils';

test.describe('Members - Family Relationships UI Suite', { tag: ['@ui'] }, () => {
  const createdMemberIds: string[] = [];
  let family: FamilyTree;

  test.beforeAll(async ({ request }) => {
    const apiClient = new ApiClient(request);
    await test.step('Send GET requests to load catalog lookups using ApiClient and verify 200 OK', async () => {
      await scenarioContext.loadFromApiClient(apiClient);
    });
  });

  test.beforeEach(async ({ familyFacade }) => {
    await test.step('Send POST requests to create cohesive family tree (Abuelo, Abuela, Padre, Madre, dos Hijos, una Hija) via Family Facade', async () => {
      family = await familyFacade.createFamilyTree();
      for (const id of family.allIds) {
        createdMemberIds.push(id);
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

  test('Verify all created family members appear in main table with their names, surnames and correct calculated ages', async ({
    membersPage,
  }) => {
    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    for (const member of family.allMembers) {
      await test.step(`Verify family member (${member.role}: ${member.lastName}) appears in table with calculated age`, async () => {
        await membersPage.clearAllFilters();
        await membersPage.filterByFirstName(member.firstName);

        const row = membersPage.getRowByIdentifier(member.firstName);
        await expect(row).toBeVisible({ timeout: 10000 });
        await expect(row).toContainText(member.lastName);
        await expect(row).toContainText(member.surName);

        const expectedAge = calculateAge(member.birthDate);
        await expect(row).toContainText(String(expectedAge));
      });
    }
  });

  test('Link family relationships from UI (Padre links Hijo, Hija and Esposa) and verify badges and perspective', async ({
    membersPage,
    memberRelationshipModal,
  }) => {
    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select Padre row in members table', async () => {
      await membersPage.filterByFirstName(family.padre.firstName);
      await membersPage.selectMemberRow(family.padre.firstName);
    });

    await test.step('Click "Relaciones Familiares" button to open modal', async () => {
      await membersPage.clickFamilyRelationships();
      expect(await memberRelationshipModal.isVisible()).toBe(true);
      await expect(memberRelationshipModal.modalTitle).toBeVisible();
      await expect(memberRelationshipModal.directMemberParagraph).toContainText(family.padre.lastName);
    });

    await test.step('Link Hijo 1 (Mateo) as "Hijo" and verify row appears in relationships table', async () => {
      const hijoFullName = `${family.hijo1.firstName} ${family.hijo1.lastName}`;
      await memberRelationshipModal.linkFamilyMember(hijoFullName, 'Hijo');

      const relRow = memberRelationshipModal.getRelationshipRow(family.hijo1.firstName);
      await expect(relRow).toBeVisible({ timeout: 10000 });
      await expect(relRow).toContainText('Hijo');
    });

    await test.step('Link Hija (Sofia) as "Hija" and verify row appears in relationships table', async () => {
      const hijaFullName = `${family.hija.firstName} ${family.hija.lastName}`;
      await memberRelationshipModal.linkFamilyMember(hijaFullName, 'Hija');

      const relRow = memberRelationshipModal.getRelationshipRow(family.hija.firstName);
      await expect(relRow).toBeVisible({ timeout: 10000 });
      await expect(relRow).toContainText('Hija');
    });

    await test.step('Link Madre (Elena) as "Esposa" and verify row appears in relationships table', async () => {
      const madreFullName = `${family.madre.firstName} ${family.madre.lastName}`;
      await memberRelationshipModal.linkFamilyMember(madreFullName, 'Esposa');

      const relRow = memberRelationshipModal.getRelationshipRow(family.madre.firstName);
      await expect(relRow).toBeVisible({ timeout: 10000 });
      await expect(relRow).toContainText('Esposa');
    });

    await test.step('Close family relationships modal', async () => {
      await memberRelationshipModal.close();
      expect(await memberRelationshipModal.isVisible()).toBe(false);
    });
  });

  test('Search and filter within family relationships table in modal', async ({
    membersPage,
    memberRelationshipModal,
  }) => {
    await test.step('Navigate to Members page and open Padre relationships modal', async () => {
      await membersPage.goto();
      await membersPage.filterByFirstName(family.padre.firstName);
      await membersPage.selectMemberRow(family.padre.firstName);
      await membersPage.clickFamilyRelationships();
      expect(await memberRelationshipModal.isVisible()).toBe(true);
    });

    await test.step('Link two relatives (Mateo and Sofia) to enable search filtering', async () => {
      const hijoFullName = `${family.hijo1.firstName} ${family.hijo1.lastName}`;
      await memberRelationshipModal.linkFamilyMember(hijoFullName, 'Hijo');

      const hijaFullName = `${family.hija.firstName} ${family.hija.lastName}`;
      await memberRelationshipModal.linkFamilyMember(hijaFullName, 'Hija');
    });

    await test.step('Search by Hijo name and verify only Hijo row is displayed', async () => {
      await memberRelationshipModal.searchWithinRelationships(family.hijo1.firstName);

      const hijoRow = memberRelationshipModal.getRelationshipRow(family.hijo1.firstName);
      const hijaRow = memberRelationshipModal.getRelationshipRow(family.hija.firstName);

      await expect(hijoRow).toBeVisible();
      await expect(hijaRow).not.toBeVisible();
    });

    await test.step('Search by Hija name and verify only Hija row is displayed', async () => {
      await memberRelationshipModal.searchWithinRelationships(family.hija.firstName);

      const hijoRow = memberRelationshipModal.getRelationshipRow(family.hijo1.firstName);
      const hijaRow = memberRelationshipModal.getRelationshipRow(family.hija.firstName);

      await expect(hijaRow).toBeVisible();
      await expect(hijoRow).not.toBeVisible();
    });

    await test.step('Clear search input and verify all linked relatives are visible again', async () => {
      await memberRelationshipModal.clearSearchWithinRelationships();

      const hijoRow = memberRelationshipModal.getRelationshipRow(family.hijo1.firstName);
      const hijaRow = memberRelationshipModal.getRelationshipRow(family.hija.firstName);

      await expect(hijoRow).toBeVisible();
      await expect(hijaRow).toBeVisible();
    });

    await test.step('Close family relationships modal', async () => {
      await memberRelationshipModal.close();
      expect(await memberRelationshipModal.isVisible()).toBe(false);
    });
  });

  test('Delete and remove a family relationship from the modal', async ({
    membersPage,
    memberRelationshipModal,
  }) => {
    await test.step('Navigate to Members page and open Padre relationships modal', async () => {
      await membersPage.goto();
      await membersPage.filterByFirstName(family.padre.firstName);
      await membersPage.selectMemberRow(family.padre.firstName);
      await membersPage.clickFamilyRelationships();
      expect(await memberRelationshipModal.isVisible()).toBe(true);
    });

    await test.step('Link Hijo 2 (Lucas) as "Hijo"', async () => {
      const hijo2FullName = `${family.hijo2.firstName} ${family.hijo2.lastName}`;
      await memberRelationshipModal.linkFamilyMember(hijo2FullName, 'Hijo');

      const relRow = memberRelationshipModal.getRelationshipRow(family.hijo2.firstName);
      await expect(relRow).toBeVisible({ timeout: 10000 });
    });

    await test.step('Delete linked relationship for Lucas and accept confirmation dialog', async () => {
      await memberRelationshipModal.deleteRelationship(family.hijo2.firstName, true);
    });

    await test.step('Verify relationship is no longer present in modal table', async () => {
      const relRow = memberRelationshipModal.getRelationshipRow(family.hijo2.firstName);
      await expect(relRow).not.toBeVisible({ timeout: 10000 });
    });

    await test.step('Close family relationships modal', async () => {
      await memberRelationshipModal.close();
      expect(await memberRelationshipModal.isVisible()).toBe(false);
    });
  });
});
