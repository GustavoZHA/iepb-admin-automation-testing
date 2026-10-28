import { test, expect } from '../../src/fixtures/testBase';
import { MemberDataReader } from '../../src/data/memberDataReader';
import { CreateMemberRequest } from '../../src/api/models/members.model';
import { ApiClient } from '../../src/api/apiClient';
import { scenarioContext } from '../../src/context/scenarioContext';
import { cleanTestMembers, deleteMemberById } from '../../src/db/helpers/memberTeardown';
import { calculateAge } from '../../src/utils/dateUtils';

test.describe('Members - Edit UI Suite', { tag: ['@ui'] }, () => {
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

    await test.step('Send POST request to /api/members to pre-seed member for edit test', async () => {
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

  test('Verify automatic age recalculation when editing birth date in personal information tab', async ({
    membersPage,
    memberFormModal,
  }) => {
    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Editar" button to open edit modal', async () => {
      await membersPage.clickEdit();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Modify birth date and verify age field automatically recalculates', async () => {
      const newBirthDate = '1998-05-10';
      const expectedAge = calculateAge(newBirthDate);

      await memberFormModal.birthDateInput.fill(newBirthDate);
      await expect(memberFormModal.ageInput).toHaveValue(String(expectedAge), { timeout: 5000 });
    });

    await test.step('Click "Cancelar" button to discard change', async () => {
      await memberFormModal.cancel();
      expect(await memberFormModal.isVisible()).toBe(false);
    });
  });

  test('Update member modifying personal information only (address and phone)', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const freshPool = MemberDataReader.generateRandomMember();
    const updatedAddress = `${freshPool.homeAddress} (Actualizado Personal)`;
    const updatedPhone = freshPool.phoneNumber;

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Editar" button to open edit modal', async () => {
      await membersPage.clickEdit();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Update address and phone in personal tab', async () => {
      await memberFormModal.homeAddressInput.fill(updatedAddress);
      await memberFormModal.phoneNumberInput.fill(updatedPhone);
    });

    await test.step('Click "Guardar Cambios" button', async () => {
      await memberFormModal.submitEdit();
    });

    await test.step('Verify updated address is reflected in members table', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByAddress(updatedAddress);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
      await expect(row).toContainText(updatedAddress);
    });

    await test.step('Click "Ver Detalle" button to verify updated details', async () => {
      await membersPage.selectMemberRow(seededMember.firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify updated address and phone in detail modal', async () => {
      const address = await memberDetailModal.getAddress();
      expect(address).toBe(updatedAddress);

      const phone = await memberDetailModal.getPhone();
      expect(phone).toBe(updatedPhone);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Update member modifying additional and emergency information', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const updatedOccupation = 'Consultor Especialista';
    const updatedEducation = 'Maestria';
    const updatedEmergencyContact = 'Contacto Modificado';
    const updatedEmergencyPhone = MemberDataReader.generateRandomPhone();

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Editar" button to open edit modal', async () => {
      await membersPage.clickEdit();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Navigate to additional tab and update emergency fields', async () => {
      await memberFormModal.goToAdditionalTab();
      await memberFormModal.occupationInput.fill(updatedOccupation);
      await memberFormModal.educationLevelInput.fill(updatedEducation);
      await memberFormModal.emergencyContactInput.fill(updatedEmergencyContact);
      await memberFormModal.emergencyPhoneInput.fill(updatedEmergencyPhone);
    });

    await test.step('Click "Guardar Cambios" button to save updates', async () => {
      await memberFormModal.submitEdit();
    });

    await test.step('Verify member remains visible in members table', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
    });

    await test.step('Click "Ver Detalle" button to verify details', async () => {
      await membersPage.selectMemberRow(seededMember.firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify member detail modal opens cleanly and close it', async () => {
      const fullName = await memberDetailModal.getFullName();
      expect(fullName).toContain(seededMember.firstName);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Update member modifying spiritual history information (church and restoration note)', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const updatedChurch = 'IEPB Piura';
    const updatedNote = 'Restaurado con recomendación pastoral';

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Editar" button to open edit modal', async () => {
      await membersPage.clickEdit();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Navigate to spiritual tab and update church and restoration note', async () => {
      await memberFormModal.goToSpiritualTab();
      await memberFormModal.conversionChurchInput.fill(updatedChurch);
      await memberFormModal.restorationNoteInput.fill(updatedNote);
    });

    await test.step('Click "Guardar Cambios" button to save updates', async () => {
      await memberFormModal.submitEdit();
    });

    await test.step('Verify member is visible in members table after save', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(seededMember.firstName);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
    });

    await test.step('Click "Ver Detalle" button to verify updated spiritual details', async () => {
      await membersPage.selectMemberRow(seededMember.firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify updated church and restoration note in detail modal', async () => {
      const church = await memberDetailModal.getConversionChurch();
      expect(church).toBe(updatedChurch);

      const note = await memberDetailModal.getRestorationNote();
      expect(note).toBe(updatedNote);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Update member modifying all tabs (personal, additional and spiritual)', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const freshPool = MemberDataReader.generateRandomMember();
    const updatedAddress = `${freshPool.homeAddress} (Completo Actualizado)`;
    const updatedPhone = freshPool.phoneNumber;
    const updatedOccupation = freshPool.occupation;
    const updatedChurch = 'IEPB Cusco';

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Editar" button to open edit modal', async () => {
      await membersPage.clickEdit();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Update personal tab fields', async () => {
      await memberFormModal.homeAddressInput.fill(updatedAddress);
      await memberFormModal.phoneNumberInput.fill(updatedPhone);
    });

    await test.step('Navigate to additional tab and update occupation', async () => {
      await memberFormModal.goToAdditionalTab();
      await memberFormModal.occupationInput.fill(updatedOccupation);
    });

    await test.step('Navigate to spiritual tab and update church', async () => {
      await memberFormModal.goToSpiritualTab();
      await memberFormModal.conversionChurchInput.fill(updatedChurch);
    });

    await test.step('Click "Guardar Cambios" button to save updates', async () => {
      await memberFormModal.submitEdit();
    });

    await test.step('Verify updated address is reflected in members table', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByAddress(updatedAddress);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
    });

    await test.step('Click "Ver Detalle" button to verify all modified fields', async () => {
      await membersPage.selectMemberRow(seededMember.firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify all modified fields in detail modal', async () => {
      const address = await memberDetailModal.getAddress();
      expect(address).toBe(updatedAddress);

      const phone = await memberDetailModal.getPhone();
      expect(phone).toBe(updatedPhone);

      const church = await memberDetailModal.getConversionChurch();
      expect(church).toBe(updatedChurch);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Cancel member edit while modifying personal information (modal closes and changes are discarded)', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const unsavedAddress = 'Dirección Que No Debe Guardarse 999';

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Editar" button to open edit modal', async () => {
      await membersPage.clickEdit();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Modify address field with unsaved value', async () => {
      await memberFormModal.homeAddressInput.fill(unsavedAddress);
    });

    await test.step('Click "Cancelar" button to discard changes', async () => {
      await memberFormModal.cancel();
      expect(await memberFormModal.isVisible()).toBe(false);
    });

    await test.step('Click "Ver Detalle" button to verify original address remains intact', async () => {
      await membersPage.selectMemberRow(seededMember.firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify original address was preserved in detail modal', async () => {
      const address = await memberDetailModal.getAddress();
      expect(address).toBe(seededMember.homeAddress);
      expect(address).not.toBe(unsavedAddress);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Cancel member edit after modifying additional and spiritual information (changes discarded)', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const unsavedChurch = 'Iglesia Falsa No Guardada';

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Editar" button to open edit modal', async () => {
      await membersPage.clickEdit();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Navigate to spiritual tab and modify church with unsaved value', async () => {
      await memberFormModal.goToSpiritualTab();
      await memberFormModal.conversionChurchInput.fill(unsavedChurch);
    });

    await test.step('Click "Cancelar" button to discard changes', async () => {
      await memberFormModal.cancel();
      expect(await memberFormModal.isVisible()).toBe(false);
    });

    await test.step('Click "Ver Detalle" button to verify original church remains intact', async () => {
      await membersPage.selectMemberRow(seededMember.firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify original church was preserved in detail modal', async () => {
      const church = await memberDetailModal.getConversionChurch();
      expect(church).toBe(seededMember.conversionChurch);
      expect(church).not.toBe(unsavedChurch);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Navigate between tabs (forward and back) modifying fields before saving changes', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const finalAddress = 'Av. Final Confirmada 888';
    const finalPhone = MemberDataReader.generateRandomPhone();
    const finalChurch = 'IEPB Callao';

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Filter and select pre-seeded member row in table', async () => {
      await membersPage.filterByFirstName(seededMember.firstName);
      await membersPage.selectMemberRow(seededMember.firstName);
    });

    await test.step('Click "Editar" button to open edit modal', async () => {
      await membersPage.clickEdit();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Update personal tab and advance to additional tab with "Siguiente"', async () => {
      await memberFormModal.homeAddressInput.fill('Dirección Temporal');
      await memberFormModal.clickNext();
    });

    await test.step('Update additional tab and advance to spiritual tab with "Siguiente"', async () => {
      await memberFormModal.occupationInput.fill('Ocupación Temporal');
      await memberFormModal.clickNext();
    });

    await test.step('Go back to personal tab using "Anterior" buttons and enter final values', async () => {
      await memberFormModal.clickPrevious(); // To additional
      await memberFormModal.clickPrevious(); // To personal
      await memberFormModal.homeAddressInput.fill(finalAddress);
      await memberFormModal.phoneNumberInput.fill(finalPhone);
    });

    await test.step('Advance to spiritual tab using "Siguiente" buttons and set final church', async () => {
      await memberFormModal.clickNext(); // To additional
      await memberFormModal.clickNext(); // To spiritual
      await memberFormModal.conversionChurchInput.fill(finalChurch);
    });

    await test.step('Click "Guardar Cambios" button to save updates', async () => {
      await memberFormModal.submitEdit();
    });

    await test.step('Verify updated address is visible in members table', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByAddress(finalAddress);
      const row = membersPage.getRowByIdentifier(seededMember.firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
      await expect(row).toContainText(finalAddress);
    });

    await test.step('Click "Ver Detalle" button to verify all final navigated modifications', async () => {
      await membersPage.selectMemberRow(seededMember.firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify final address, phone and church in detail modal', async () => {
      const address = await memberDetailModal.getAddress();
      expect(address).toBe(finalAddress);

      const phone = await memberDetailModal.getPhone();
      expect(phone).toBe(finalPhone);

      const church = await memberDetailModal.getConversionChurch();
      expect(church).toBe(finalChurch);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });
});
