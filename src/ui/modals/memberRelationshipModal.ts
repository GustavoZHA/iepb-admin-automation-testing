import { Page, Locator } from '@playwright/test';

export class MemberRelationshipModal {
  readonly modalContainer: Locator;
  readonly modalTitle: Locator;
  readonly closeButton: Locator;
  readonly footerCloseButton: Locator;
  readonly directMemberParagraph: Locator;
  readonly vinculationHeading: Locator;
  readonly relativeSelectButton: Locator;
  readonly searchRelativeInput: Locator;
  readonly relationshipTypeSelect: Locator;
  readonly addRelationshipButton: Locator;
  readonly searchRelationshipsInput: Locator;
  readonly relationshipsTable: Locator;
  readonly relationshipsTableRows: Locator;

  constructor(private readonly page: Page) {
    this.modalContainer = page.locator('div.fixed.inset-0').filter({
      has: page.getByRole('heading', { name: 'Relaciones Familiares' }),
    });

    this.modalTitle = this.modalContainer.getByRole('heading', { level: 2, name: 'Relaciones Familiares' });
    this.closeButton = this.modalContainer.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    this.footerCloseButton = this.modalContainer.getByRole('button', { name: 'Cerrar', exact: true });
    this.directMemberParagraph = this.modalContainer.locator('p').filter({ hasText: /Familiar directo de:/i });
    this.vinculationHeading = this.modalContainer.locator('h3').filter({ hasText: /Vincular Familiar para/i });
    this.relativeSelectButton = this.modalContainer.getByRole('button', { name: /Buscar o seleccionar familiar/i });
    this.searchRelativeInput = this.modalContainer.locator('input[placeholder*="Buscar por nombre o teléfono"]');
    this.relationshipTypeSelect = this.modalContainer.locator('select').filter({
      has: page.locator('option', { hasText: 'Seleccione parentesco...' }),
    });
    this.addRelationshipButton = this.modalContainer.getByRole('button', { name: /Vincular Familiar|Guardando/i });
    this.searchRelationshipsInput = this.modalContainer.locator('input[placeholder*="Buscar entre los familiares"]');
    this.relationshipsTable = this.modalContainer.locator('table');
    this.relationshipsTableRows = this.modalContainer.locator('tbody tr');
  }

  async isVisible(): Promise<boolean> {
    return this.modalContainer.isVisible();
  }

  async selectRelativeMember(relativeFullName: string): Promise<void> {
    // Click the select button to open SearchableMemberSelect dropdown
    await this.relativeSelectButton.click();

    // If search input inside the dropdown is visible, filter by name
    if (await this.searchRelativeInput.isVisible()) {
      await this.searchRelativeInput.fill(relativeFullName);
    }

    // Click candidate member option button from list
    const option = this.modalContainer
      .locator('button')
      .filter({ hasText: relativeFullName })
      .first();
    await option.click();
  }

  async selectRelationshipType(relationshipLabel: string): Promise<void> {
    await this.relationshipTypeSelect.selectOption({ label: relationshipLabel });
  }

  async submitRelationship(): Promise<void> {
    await this.addRelationshipButton.click();
    // Wait for mutation to complete and button to be idle
    await this.page.waitForTimeout(500);
  }

  async linkFamilyMember(relativeFullName: string, relationshipLabel: string): Promise<void> {
    await this.selectRelativeMember(relativeFullName);
    await this.selectRelationshipType(relationshipLabel);
    await this.submitRelationship();
  }

  getRelationshipRow(relativeName: string): Locator {
    return this.modalContainer.locator('tbody tr').filter({ hasText: relativeName }).first();
  }

  async isRelationshipPresent(relativeName: string): Promise<boolean> {
    const row = this.getRelationshipRow(relativeName);
    return await row.isVisible();
  }

  async searchWithinRelationships(query: string): Promise<void> {
    await this.searchRelationshipsInput.fill(query);
  }

  async clearSearchWithinRelationships(): Promise<void> {
    await this.searchRelationshipsInput.fill('');
  }

  async deleteRelationship(relativeName: string, confirmAction = true): Promise<void> {
    const row = this.getRelationshipRow(relativeName);
    const deleteBtn = row.locator('button[title="Quitar relación"]');

    this.page.once('dialog', async (dialog) => {
      if (confirmAction) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });

    await deleteBtn.click();
    await this.page.waitForTimeout(500);
  }

  async close(): Promise<void> {
    if (await this.footerCloseButton.isVisible()) {
      await this.footerCloseButton.click();
    } else {
      await this.closeButton.click();
    }
    await this.modalContainer.waitFor({ state: 'detached', timeout: 10000 });
  }
}
