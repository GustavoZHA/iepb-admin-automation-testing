import { Page, Locator } from '@playwright/test';

export class MemberDetailModal {
  readonly modalContainer: Locator;
  readonly modalTitle: Locator;
  readonly closeButton: Locator;
  readonly memberIdText: Locator;
  readonly fullNameText: Locator;

  constructor(private readonly page: Page) {
    this.modalContainer = page.locator('div.fixed.inset-0').filter({
      has: page.getByRole('heading', { name: 'Detalle del Miembro' }),
    });

    this.modalTitle = this.modalContainer.getByRole('heading', { level: 2, name: 'Detalle del Miembro' });
    this.closeButton = this.modalContainer.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
    this.memberIdText = this.modalContainer.locator('span.font-mono');
    this.fullNameText = this.modalContainer.locator('span.font-bold');
  }

  async isVisible(): Promise<boolean> {
    return this.modalContainer.isVisible();
  }

  async getMemberId(): Promise<string> {
    return (await this.memberIdText.textContent())?.trim() || '';
  }

  async getFullName(): Promise<string> {
    return (await this.fullNameText.textContent())?.trim() || '';
  }

  getCardByLabel(label: string): Locator {
    return this.modalContainer.locator('div').filter({
      has: this.page.locator(`span:text-is("${label}")`),
    }).last();
  }

  async getFieldValue(label: string): Promise<string> {
    const card = this.getCardByLabel(label);
    const spans = card.locator('span');
    const count = await spans.count();
    if (count > 1) {
      return (await spans.nth(count - 1).textContent())?.trim() || '';
    }
    return (await card.textContent())?.trim() || '';
  }

  async getEmail(): Promise<string> {
    return this.getFieldValue('Correo Electrónico');
  }

  async getPhone(): Promise<string> {
    return this.getFieldValue('Número Telefónico');
  }

  async getAddress(): Promise<string> {
    return this.getFieldValue('Dirección');
  }

  async getConversionChurch(): Promise<string> {
    return this.getFieldValue('Iglesia de Conversión');
  }

  async getRestorationNote(): Promise<string> {
    return this.getFieldValue('Nota de Restauración');
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.modalContainer.waitFor({ state: 'detached', timeout: 10000 });
  }
}
