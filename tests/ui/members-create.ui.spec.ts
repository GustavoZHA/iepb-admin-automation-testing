import { test, expect } from '../../src/fixtures/testBase';
import { MemberDataReader } from '../../src/data/memberDataReader';
import { ApiClient } from '../../src/api/apiClient';
import { scenarioContext } from '../../src/context/scenarioContext';
import { cleanTestMembers, deleteMemberById } from '../../src/db/helpers/memberTeardown';
import { calculateAge } from '../../src/utils/dateUtils';

test.describe('Members - Create UI Suite', { tag: ['@ui'] }, () => {
  const createdMemberIds: string[] = [];

  test.beforeAll(async ({ request }) => {
    const apiClient = new ApiClient(request);
    await test.step('Send GET requests to load catalog lookups using ApiClient and verify 200 OK', async () => {
      await scenarioContext.loadFromApiClient(apiClient);
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

  test('Verify automatic age calculation based on birth date in personal information tab', async ({
    membersPage,
    memberFormModal,
  }) => {
    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Click "Crear" button to open creation modal', async () => {
      await membersPage.clickCreate();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Enter birth date and verify calculated age matches automatically', async () => {
      const birthDate = '2000-01-15';
      const expectedAge = calculateAge(birthDate);

      await memberFormModal.birthDateInput.fill(birthDate);
      await expect(memberFormModal.ageInput).toHaveValue(String(expectedAge), { timeout: 5000 });
    });

    await test.step('Update birth date to an older year and verify age updates dynamically', async () => {
      const olderBirthDate = '1985-06-20';
      const expectedOlderAge = calculateAge(olderBirthDate);

      await memberFormModal.birthDateInput.fill(olderBirthDate);
      await expect(memberFormModal.ageInput).toHaveValue(String(expectedOlderAge), { timeout: 5000 });
    });

    await test.step('Click "Cancelar" button to close modal', async () => {
      await memberFormModal.cancel();
      expect(await memberFormModal.isVisible()).toBe(false);
    });
  });

  test('Create member with complete personal information only (additional and spiritual empty)', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const poolMember = MemberDataReader.generateRandomMember();
    const timestamp = Date.now();
    const firstName = `TEST_AUT_${poolMember.firstName.split(' ')[0]}_P1_${timestamp}`;

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Click "Crear" button to open creation modal', async () => {
      await membersPage.clickCreate();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Fill complete personal information tab with pool data', async () => {
      await memberFormModal.fillPersonalInformation({
        firstName,
        lastName: poolMember.lastName,
        surName: poolMember.surName,
        genderId: String(poolMember.genderId),
        birthDate: poolMember.birthDate,
        homeAddress: poolMember.homeAddress,
        maritalStatusId: String(poolMember.maritalStatusId),
        emailAddress: poolMember.emailAddress,
        phoneNumber: poolMember.phoneNumber,
      });
    });

    await test.step('Click "Crear Miembro" button directly from personal tab', async () => {
      await memberFormModal.submitCreate();
    });

    await test.step('Verify created member is listed in members table', async () => {
      await membersPage.filterByFirstName(firstName);
      const row = membersPage.getRowByIdentifier(firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
      await expect(row).toContainText(poolMember.lastName);
    });

    await test.step('Click "Ver Detalle" button to verify personal details in detail modal', async () => {
      await membersPage.selectMemberRow(firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify personal fields in detail modal match created data', async () => {
      const fullName = await memberDetailModal.getFullName();
      expect(fullName).toContain(firstName);
      expect(fullName).toContain(poolMember.lastName);

      const email = await memberDetailModal.getEmail();
      expect(email).toBe(poolMember.emailAddress);

      const address = await memberDetailModal.getAddress();
      expect(address).toBe(poolMember.homeAddress);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Create member with complete personal, additional and emergency information (spiritual empty)', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const poolMember = MemberDataReader.generateRandomMember();
    const timestamp = Date.now();
    const firstName = `TEST_AUT_${poolMember.firstName.split(' ')[0]}_P2_${timestamp}`;
    const emergencyContact = `${poolMember.surName} Contacto`;
    const emergencyPhone = MemberDataReader.generateRandomPhone();

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Click "Crear" button to open creation modal', async () => {
      await membersPage.clickCreate();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Fill personal information tab with pool data', async () => {
      await memberFormModal.fillPersonalInformation({
        firstName,
        lastName: poolMember.lastName,
        surName: poolMember.surName,
        genderId: String(poolMember.genderId),
        birthDate: poolMember.birthDate,
        homeAddress: poolMember.homeAddress,
        maritalStatusId: String(poolMember.maritalStatusId),
        emailAddress: poolMember.emailAddress,
        phoneNumber: poolMember.phoneNumber,
      });
    });

    await test.step('Click "Siguiente" button to advance to additional information tab', async () => {
      await memberFormModal.clickNext();
    });

    await test.step('Fill additional and emergency information tab with pool data', async () => {
      await memberFormModal.fillAdditionalInformation({
        educationLevel: poolMember.educationLevel,
        occupation: poolMember.occupation,
        emergencyContact,
        emergencyPhone,
      });
    });

    await test.step('Click "Crear Miembro" button from additional tab', async () => {
      await memberFormModal.submitCreate();
    });

    await test.step('Verify created member is listed in members table', async () => {
      await membersPage.filterByFirstName(firstName);
      const row = membersPage.getRowByIdentifier(firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
      await expect(row).toContainText(poolMember.lastName);
    });

    await test.step('Click "Ver Detalle" button to verify details', async () => {
      await membersPage.selectMemberRow(firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify details match created data and close modal', async () => {
      const fullName = await memberDetailModal.getFullName();
      expect(fullName).toContain(firstName);
      expect(fullName).toContain(poolMember.lastName);

      const address = await memberDetailModal.getAddress();
      expect(address).toBe(poolMember.homeAddress);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Create member with complete personal, additional, emergency and spiritual history (all tabs full)', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const poolMember = MemberDataReader.generateRandomMember();
    const timestamp = Date.now();
    const firstName = `TEST_AUT_${poolMember.firstName.split(' ')[0]}_Full_${timestamp}`;

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Click "Crear" button to open creation modal', async () => {
      await membersPage.clickCreate();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Fill personal information tab with pool data', async () => {
      await memberFormModal.fillPersonalInformation({
        firstName,
        lastName: poolMember.lastName,
        surName: poolMember.surName,
        genderId: String(poolMember.genderId),
        birthDate: poolMember.birthDate,
        homeAddress: poolMember.homeAddress,
        maritalStatusId: String(poolMember.maritalStatusId),
        emailAddress: poolMember.emailAddress,
        phoneNumber: poolMember.phoneNumber,
      });
    });

    await test.step('Click "Siguiente" button and fill additional information tab', async () => {
      await memberFormModal.clickNext();
      await memberFormModal.fillAdditionalInformation({
        educationLevel: poolMember.educationLevel,
        occupation: poolMember.occupation,
        emergencyContact: `${poolMember.surName} Familiar`,
        emergencyPhone: MemberDataReader.generateRandomPhone(),
      });
    });

    await test.step('Click "Siguiente" button and fill spiritual history tab', async () => {
      await memberFormModal.clickNext();
      await memberFormModal.fillSpiritualInformation({
        membershipStatusId: String(poolMember.membershipStatusId),
        spiritualLevelId: String(poolMember.spiritualLevelId),
        isActive: true,
        isConverted: true,
        conversionDate: poolMember.conversionDate,
        conversionChurch: poolMember.church,
        isBaptized: true,
        baptismDate: poolMember.baptismDate,
        baptismChurch: poolMember.church,
      });
    });

    await test.step('Click "Crear Miembro" button and submit form', async () => {
      await memberFormModal.submitCreate();
    });

    await test.step('Verify created member is listed in members table', async () => {
      await membersPage.filterByFirstName(firstName);
      const row = membersPage.getRowByIdentifier(firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
      await expect(row).toContainText(poolMember.lastName);
      await expect(row).toContainText(poolMember.surName);
    });

    await test.step('Click "Ver Detalle" button to verify all created details', async () => {
      await membersPage.selectMemberRow(firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify all tabs information in detail modal', async () => {
      const fullName = await memberDetailModal.getFullName();
      expect(fullName).toContain(firstName);
      expect(fullName).toContain(poolMember.lastName);

      const email = await memberDetailModal.getEmail();
      expect(email).toBe(poolMember.emailAddress);

      const phone = await memberDetailModal.getPhone();
      expect(phone).toBe(poolMember.phoneNumber);

      const address = await memberDetailModal.getAddress();
      expect(address).toBe(poolMember.homeAddress);

      const church = await memberDetailModal.getConversionChurch();
      expect(church).toBe(poolMember.church);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Cancel member creation while filling personal information (modal closes and member is not created)', async ({
    membersPage,
    memberFormModal,
  }) => {
    const timestamp = Date.now();
    const firstName = `TEST_AUT_Cancel_P1_${timestamp}`;

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Click "Crear" button to open creation modal', async () => {
      await membersPage.clickCreate();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Fill personal fields', async () => {
      await memberFormModal.firstNameInput.fill(firstName);
      await memberFormModal.lastNameInput.fill('Cancelado');
      await memberFormModal.birthDateInput.fill('1992-04-10');
    });

    await test.step('Click "Cancelar" button to dismiss modal', async () => {
      await memberFormModal.cancel();
      expect(await memberFormModal.isVisible()).toBe(false);
    });

    await test.step('Verify cancelled member was not created in members table', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(firstName);
      const row = membersPage.getRowByIdentifier(firstName);
      await expect(row).not.toBeVisible();
    });
  });

  test('Cancel member creation after filling additional and emergency information (member is not created)', async ({
    membersPage,
    memberFormModal,
  }) => {
    const timestamp = Date.now();
    const firstName = `TEST_AUT_Cancel_P2_${timestamp}`;

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Click "Crear" button to open creation modal', async () => {
      await membersPage.clickCreate();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Fill personal fields and advance to additional tab', async () => {
      await memberFormModal.firstNameInput.fill(firstName);
      await memberFormModal.lastNameInput.fill('Descartado');
      await memberFormModal.birthDateInput.fill('1994-08-22');
      await memberFormModal.clickNext();
    });

    await test.step('Fill additional fields in second tab', async () => {
      await memberFormModal.educationLevelInput.fill('Universitario');
      await memberFormModal.occupationInput.fill('Arquitecto');
    });

    await test.step('Click "Cancelar" button to dismiss modal', async () => {
      await memberFormModal.cancel();
      expect(await memberFormModal.isVisible()).toBe(false);
    });

    await test.step('Verify member was not created in members table', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(firstName);
      const row = membersPage.getRowByIdentifier(firstName);
      await expect(row).not.toBeVisible();
    });
  });

  test('Cancel member creation after filling complete information across all tabs (member is not created)', async ({
    membersPage,
    memberFormModal,
  }) => {
    const timestamp = Date.now();
    const firstName = `TEST_AUT_Cancel_Full_${timestamp}`;

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Click "Crear" button to open creation modal', async () => {
      await membersPage.clickCreate();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Fill personal tab and advance to additional tab', async () => {
      await memberFormModal.firstNameInput.fill(firstName);
      await memberFormModal.lastNameInput.fill('Interrumpido');
      await memberFormModal.birthDateInput.fill('1990-11-05');
      await memberFormModal.clickNext();
    });

    await test.step('Fill additional tab and advance to spiritual tab', async () => {
      await memberFormModal.educationLevelInput.fill('Licenciatura');
      await memberFormModal.occupationInput.fill('Contador');
      await memberFormModal.clickNext();
    });

    await test.step('Fill spiritual tab fields completely', async () => {
      await memberFormModal.conversionChurchInput.fill('IEPB Central');
      await memberFormModal.restorationNoteInput.fill('Nota que será cancelada');
    });

    await test.step('Click "Cancelar" button to discard complete form', async () => {
      await memberFormModal.cancel();
      expect(await memberFormModal.isVisible()).toBe(false);
    });

    await test.step('Verify member was not created in members table', async () => {
      await membersPage.clearAllFilters();
      await membersPage.filterByFirstName(firstName);
      const row = membersPage.getRowByIdentifier(firstName);
      await expect(row).not.toBeVisible();
    });
  });

  test('Navigate between tabs (forward and back) modifying personal and additional details before submission', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const poolMember = MemberDataReader.generateRandomMember();
    const timestamp = Date.now();
    const firstName = `TEST_AUT_${poolMember.firstName.split(' ')[0]}_Nav_${timestamp}`;
    const initialAddress = 'Dirección Inicial 123';
    const modifiedAddress = `${poolMember.homeAddress} (Corregida)`;
    const initialEmail = `inicial_${timestamp}@example.com`;
    const modifiedEmail = poolMember.emailAddress;

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Click "Crear" button to open creation modal', async () => {
      await membersPage.clickCreate();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Fill personal tab with initial values', async () => {
      await memberFormModal.fillPersonalInformation({
        firstName,
        lastName: poolMember.lastName,
        surName: poolMember.surName,
        genderId: '0',
        birthDate: poolMember.birthDate,
        homeAddress: initialAddress,
        emailAddress: initialEmail,
        phoneNumber: poolMember.phoneNumber,
      });
    });

    await test.step('Click "Siguiente" button to advance to additional tab', async () => {
      await memberFormModal.clickNext();
      await memberFormModal.educationLevelInput.fill(poolMember.educationLevel);
      await memberFormModal.occupationInput.fill(poolMember.occupation);
    });

    await test.step('Click "Anterior" button to return to personal tab and modify address and email', async () => {
      await memberFormModal.clickPrevious();
      await memberFormModal.homeAddressInput.fill(modifiedAddress);
      await memberFormModal.emailAddressInput.fill(modifiedEmail);
    });

    await test.step('Click "Siguiente" button to return to additional tab', async () => {
      await memberFormModal.clickNext();
    });

    await test.step('Submit member creation with "Crear Miembro"', async () => {
      await memberFormModal.submitCreate();
    });

    await test.step('Verify created member is listed in members table', async () => {
      await membersPage.filterByFirstName(firstName);
      const row = membersPage.getRowByIdentifier(firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
      await expect(row).toContainText(poolMember.lastName);
    });

    await test.step('Click "Ver Detalle" button to verify modified values were saved', async () => {
      await membersPage.selectMemberRow(firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify modified address and email in detail modal', async () => {
      const address = await memberDetailModal.getAddress();
      expect(address).toBe(modifiedAddress);

      const email = await memberDetailModal.getEmail();
      expect(email).toBe(modifiedEmail);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });

  test('Navigate backwards from spiritual history to edit previous tabs and successfully create member', async ({
    membersPage,
    memberFormModal,
    memberDetailModal,
  }) => {
    const poolMember = MemberDataReader.generateRandomMember();
    const timestamp = Date.now();
    const firstName = `TEST_AUT_${poolMember.firstName.split(' ')[0]}_NavBack_${timestamp}`;
    const modifiedPhone = MemberDataReader.generateRandomPhone();
    const modifiedChurch = 'IEPB Sur';

    await test.step('Navigate to Members page', async () => {
      await membersPage.goto();
    });

    await test.step('Click "Crear" button to open creation modal', async () => {
      await membersPage.clickCreate();
      expect(await memberFormModal.isVisible()).toBe(true);
    });

    await test.step('Fill personal tab and advance to additional tab', async () => {
      await memberFormModal.fillPersonalInformation({
        firstName,
        lastName: poolMember.lastName,
        surName: poolMember.surName,
        genderId: '1',
        birthDate: poolMember.birthDate,
        homeAddress: poolMember.homeAddress,
        emailAddress: poolMember.emailAddress,
        phoneNumber: poolMember.phoneNumber,
      });
      await memberFormModal.clickNext();
    });

    await test.step('Fill additional tab and advance to spiritual tab', async () => {
      await memberFormModal.fillAdditionalInformation({
        educationLevel: poolMember.educationLevel,
        occupation: poolMember.occupation,
      });
      await memberFormModal.clickNext();
    });

    await test.step('Fill spiritual tab fields initially', async () => {
      await memberFormModal.fillSpiritualInformation({
        isActive: true,
        isConverted: true,
        conversionDate: poolMember.conversionDate,
        conversionChurch: poolMember.church,
      });
    });

    await test.step('Click "Anterior" button to return to additional tab', async () => {
      await memberFormModal.clickPrevious();
      await memberFormModal.occupationInput.fill('Ocupación Modificada');
    });

    await test.step('Click "Anterior" button again to return to personal tab and modify phone', async () => {
      await memberFormModal.clickPrevious();
      await memberFormModal.phoneNumberInput.fill(modifiedPhone);
    });

    await test.step('Advance forward through tabs back to spiritual tab and modify church', async () => {
      await memberFormModal.clickNext(); // To additional
      await memberFormModal.clickNext(); // To spiritual
      await memberFormModal.conversionChurchInput.fill(modifiedChurch);
    });

    await test.step('Submit member creation form with "Crear Miembro"', async () => {
      await memberFormModal.submitCreate();
    });

    await test.step('Verify created member is listed in members table', async () => {
      await membersPage.filterByFirstName(firstName);
      const row = membersPage.getRowByIdentifier(firstName);
      await expect(row).toBeVisible({ timeout: 10000 });
      await expect(row).toContainText(poolMember.lastName);
    });

    await test.step('Click "Ver Detalle" button to verify modified values', async () => {
      await membersPage.selectMemberRow(firstName);
      await membersPage.clickDetail();
      expect(await memberDetailModal.isVisible()).toBe(true);
    });

    await test.step('Verify modified phone and conversion church in detail modal', async () => {
      const phone = await memberDetailModal.getPhone();
      expect(phone).toBe(modifiedPhone);

      const church = await memberDetailModal.getConversionChurch();
      expect(church).toBe(modifiedChurch);

      await memberDetailModal.close();
      expect(await memberDetailModal.isVisible()).toBe(false);
    });
  });
});
