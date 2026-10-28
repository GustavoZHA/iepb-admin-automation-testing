import { Page, Locator } from '@playwright/test';

export class MembersPage {
  readonly pageTitle: Locator;
  readonly membersTab: Locator;

  // Toolbar Action Buttons
  readonly createButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly viewDetailButton: Locator;
  readonly familyRelationshipsButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly generalSearchInput: Locator;

  // Table Structure
  readonly table: Locator;
  readonly tableRows: Locator;

  // Column Filters
  readonly firstNameFilterInput: Locator;
  readonly lastNameFilterInput: Locator;
  readonly surNameFilterInput: Locator;
  readonly genderFilterSelect: Locator;
  readonly ageFilterInput: Locator;
  readonly birthDateFilterInput: Locator;
  readonly addressFilterInput: Locator;
  readonly maritalStatusFilterInput: Locator;
  readonly conversionDateFilterInput: Locator;
  readonly isActiveFilterInput: Locator;
  readonly isDeletedFilterInput: Locator;
  readonly createdAtFilterInput: Locator;

  constructor(private readonly page: Page) {
    this.pageTitle = page.getByRole('heading', { level: 1, name: 'Gestión de Miembros' });
    this.membersTab = page.getByRole('button', { name: 'Miembros', exact: true });

    // Toolbar Actions
    this.createButton = page.getByRole('button', { name: 'Crear', exact: true });
    this.editButton = page.getByRole('button', { name: 'Editar', exact: true });
    this.deleteButton = page.getByRole('button', { name: 'Eliminar', exact: true });
    this.viewDetailButton = page.getByRole('button', { name: 'Ver Detalle', exact: true });
    this.familyRelationshipsButton = page.getByRole('button', { name: 'Relaciones Familiares', exact: true });
    this.clearFiltersButton = page.getByRole('button', { name: 'Quitar filtros', exact: true });
    this.generalSearchInput = page.getByPlaceholder('Buscar por nombre, fecha, etc...');

    // Table
    this.table = page.locator('table');
    this.tableRows = page.locator('tbody tr');

    // Column Filters (Direct and robust matching against span label inside th)
    this.firstNameFilterInput = page.locator('th:has(span:text-is("Nombre")) input');
    this.lastNameFilterInput = page.locator('th:has(span:text-is("Apellido")) input');
    this.surNameFilterInput = page.locator('th:has(span:text-is("Segundo Apellido")) input');
    this.genderFilterSelect = page.locator('th:has(span:text-is("Género")) select');
    this.ageFilterInput = page.locator('th:has(span:text-is("Edad")) input');
    this.birthDateFilterInput = page.locator('th:has(span:text-is("Fecha Nac.")) input');
    this.addressFilterInput = page.locator('th:has(span:text-is("Dirección")) input');
    this.maritalStatusFilterInput = page.locator('th:has(span:text-is("Estado Civil")) input');
    this.conversionDateFilterInput = page.locator('th:has(span:text-is("Fecha Conversión")) input');
    this.isActiveFilterInput = page.locator('th:has(span:text-is("Activo")) input');
    this.isDeletedFilterInput = page.locator('th:has(span:text-is("Eliminado")) input');
    this.createdAtFilterInput = page.locator('th:has(span:text-is("Creado en")) input');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    if (await this.membersTab.isVisible()) {
      await this.membersTab.click();
    }
    await this.pageTitle.waitFor({ state: 'visible', timeout: 15000 });
  }

  async searchGeneral(query: string): Promise<void> {
    await this.generalSearchInput.fill(query);
  }

  async filterByFirstName(firstName: string): Promise<void> {
    await this.firstNameFilterInput.fill(firstName);
  }

  async filterByLastName(lastName: string): Promise<void> {
    await this.lastNameFilterInput.fill(lastName);
  }

  async filterBySurName(surName: string): Promise<void> {
    await this.surNameFilterInput.fill(surName);
  }

  async filterByGender(gender: string): Promise<void> {
    await this.genderFilterSelect.selectOption({ label: gender });
  }

  async filterByAge(age: string): Promise<void> {
    await this.ageFilterInput.fill(age);
  }

  async filterByBirthDate(birthDate: string): Promise<void> {
    await this.birthDateFilterInput.fill(birthDate);
  }

  async filterByAddress(address: string): Promise<void> {
    await this.addressFilterInput.fill(address);
  }

  async filterByMaritalStatus(maritalStatus: string): Promise<void> {
    await this.maritalStatusFilterInput.fill(maritalStatus);
  }

  async filterByConversionDate(conversionDate: string): Promise<void> {
    await this.conversionDateFilterInput.fill(conversionDate);
  }

  async filterByIsActive(activeValue: string): Promise<void> {
    await this.isActiveFilterInput.fill(activeValue);
  }

  async filterByIsDeleted(deletedValue: string): Promise<void> {
    await this.isDeletedFilterInput.fill(deletedValue);
  }

  async filterByCreatedAt(createdAt: string): Promise<void> {
    await this.createdAtFilterInput.fill(createdAt);
  }

  async clearAllFilters(): Promise<void> {
    if (await this.clearFiltersButton.isEnabled()) {
      await this.clearFiltersButton.click();
    }
  }

  getRowByIdentifier(identifier: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: identifier }).first();
  }

  async selectMemberRow(identifier: string): Promise<void> {
    const row = this.getRowByIdentifier(identifier);
    await row.waitFor({ state: 'visible', timeout: 10000 });
    await row.click();
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click();
  }

  async clickEdit(): Promise<void> {
    await this.editButton.click();
  }

  async clickDelete(confirmAction = true): Promise<void> {
    this.page.once('dialog', async (dialog) => {
      if (confirmAction) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
    await this.deleteButton.click();
  }

  async clickDetail(): Promise<void> {
    await this.viewDetailButton.click();
  }

  async clickFamilyRelationships(): Promise<void> {
    await this.familyRelationshipsButton.click();
  }
}
