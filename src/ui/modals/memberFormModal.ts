import { Page, Locator } from '@playwright/test';

export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  surName?: string;
  genderId: string;
  birthDate: string;
  homeAddress?: string;
  maritalStatusId?: string;
  emailAddress?: string;
  phoneNumber?: string;
}

export interface AdditionalInfoData {
  educationLevel?: string;
  occupation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface SpiritualInfoData {
  membershipStatusId?: string;
  spiritualLevelId?: string;
  isActive?: boolean;
  isConverted?: boolean;
  conversionDate?: string;
  conversionChurch?: string;
  isBaptized?: boolean;
  baptismDate?: string;
  baptismChurch?: string;
  restorationDate?: string;
  restorationNote?: string;
}

export class MemberFormModal {
  readonly modalContainer: Locator;
  readonly modalTitle: Locator;
  readonly closeButton: Locator;

  // Tabs
  readonly personalTabButton: Locator;
  readonly additionalTabButton: Locator;
  readonly spiritualTabButton: Locator;

  // Personal Info Locators
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly surNameInput: Locator;
  readonly genderSelect: Locator;
  readonly birthDateInput: Locator;
  readonly ageInput: Locator;
  readonly homeAddressInput: Locator;
  readonly maritalStatusSelect: Locator;
  readonly emailAddressInput: Locator;
  readonly phoneNumberInput: Locator;

  // Additional Info Locators
  readonly educationLevelInput: Locator;
  readonly occupationInput: Locator;
  readonly emergencyContactInput: Locator;
  readonly emergencyPhoneInput: Locator;

  // Spiritual Info Locators
  readonly membershipStatusSelect: Locator;
  readonly spiritualLevelSelect: Locator;
  readonly isActiveSelect: Locator;
  readonly isConvertedSelect: Locator;
  readonly conversionDateInput: Locator;
  readonly conversionChurchInput: Locator;
  readonly isBaptizedSelect: Locator;
  readonly baptismDateInput: Locator;
  readonly baptismChurchInput: Locator;
  readonly restorationDateInput: Locator;
  readonly restorationNoteInput: Locator;

  // Action Buttons
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly cancelButton: Locator;
  readonly createMemberButton: Locator;
  readonly saveChangesButton: Locator;

  constructor(private readonly page: Page) {
    this.modalContainer = page.locator('div.fixed.inset-0').filter({
      has: page.getByRole('heading', { name: /(Agregar Nuevo Miembro|Editar Miembro)/i }),
    });

    this.modalTitle = this.modalContainer.getByRole('heading', { level: 2 });
    this.closeButton = this.modalContainer.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();

    // Tabs
    this.personalTabButton = this.modalContainer.getByRole('button', { name: /1\.\s*Información Personal/i });
    this.additionalTabButton = this.modalContainer.getByRole('button', { name: /2\.\s*Adicional y Emergencia/i });
    this.spiritualTabButton = this.modalContainer.getByRole('button', { name: /3\.\s*Historia Espiritual/i });

    // Inputs Tab 1
    this.firstNameInput = this.modalContainer.locator('input[name="firstName"]');
    this.lastNameInput = this.modalContainer.locator('input[name="lastName"]');
    this.surNameInput = this.modalContainer.locator('input[name="surName"]');
    this.genderSelect = this.modalContainer.locator('select[name="genderId"]');
    this.birthDateInput = this.modalContainer.locator('input[name="birthDate"]');
    this.ageInput = this.modalContainer.locator('input[name="age"]');
    this.homeAddressInput = this.modalContainer.locator('input[name="homeAddress"]');
    this.maritalStatusSelect = this.modalContainer.locator('select[name="maritalStatusId"]');
    this.emailAddressInput = this.modalContainer.locator('input[name="emailAddress"]');
    this.phoneNumberInput = this.modalContainer.locator('input[name="phoneNumber"]');

    // Inputs Tab 2
    this.educationLevelInput = this.modalContainer.locator('input[name="educationLevel"]');
    this.occupationInput = this.modalContainer.locator('input[name="occupation"]');
    this.emergencyContactInput = this.modalContainer.locator('input[name="emergencyContact"]');
    this.emergencyPhoneInput = this.modalContainer.locator('input[name="emergencyPhone"]');

    // Inputs Tab 3
    this.membershipStatusSelect = this.modalContainer.locator('select[name="membershipStatusId"]');
    this.spiritualLevelSelect = this.modalContainer.locator('select[name="spiritualLevelId"]');
    this.isActiveSelect = this.modalContainer.locator('select[name="isActive"]');
    this.isConvertedSelect = this.modalContainer.locator('select[name="isConverted"]');
    this.conversionDateInput = this.modalContainer.locator('input[name="conversionDate"]');
    this.conversionChurchInput = this.modalContainer.locator('input[name="conversionChurch"]');
    this.isBaptizedSelect = this.modalContainer.locator('select[name="isBaptized"]');
    this.baptismDateInput = this.modalContainer.locator('input[name="baptismDate"]');
    this.baptismChurchInput = this.modalContainer.locator('input[name="baptismChurch"]');
    this.restorationDateInput = this.modalContainer.locator('input[name="restorationDate"]');
    this.restorationNoteInput = this.modalContainer.locator('input[name="restorationNote"]');

    // Controls
    this.nextButton = this.modalContainer.getByRole('button', { name: 'Siguiente', exact: true });
    this.previousButton = this.modalContainer.getByRole('button', { name: 'Anterior', exact: true });
    this.cancelButton = this.modalContainer.getByRole('button', { name: 'Cancelar', exact: true });
    this.createMemberButton = this.modalContainer.getByRole('button', { name: 'Crear Miembro', exact: true });
    this.saveChangesButton = this.modalContainer.getByRole('button', { name: 'Guardar Cambios', exact: true });
  }

  async isVisible(): Promise<boolean> {
    return this.modalContainer.isVisible();
  }

  async getAgeValue(): Promise<string> {
    return await this.ageInput.inputValue();
  }

  async goToPersonalTab(): Promise<void> {
    await this.personalTabButton.click();
  }

  async goToAdditionalTab(): Promise<void> {
    await this.additionalTabButton.click();
  }

  async goToSpiritualTab(): Promise<void> {
    await this.spiritualTabButton.click();
  }

  async fillPersonalInformation(data: PersonalInfoData): Promise<void> {
    await this.goToPersonalTab();
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    if (data.surName !== undefined) {
      await this.surNameInput.fill(data.surName);
    }
    if (data.genderId !== undefined) {
      await this.genderSelect.selectOption(data.genderId);
    }
    if (data.birthDate !== undefined) {
      await this.birthDateInput.fill(data.birthDate);
    }
    if (data.homeAddress !== undefined) {
      await this.homeAddressInput.fill(data.homeAddress);
    }
    if (data.maritalStatusId !== undefined) {
      await this.maritalStatusSelect.selectOption(data.maritalStatusId);
    }
    if (data.emailAddress !== undefined) {
      await this.emailAddressInput.fill(data.emailAddress);
    }
    if (data.phoneNumber !== undefined) {
      await this.phoneNumberInput.fill(data.phoneNumber);
    }
  }

  async fillAdditionalInformation(data: AdditionalInfoData): Promise<void> {
    await this.goToAdditionalTab();
    if (data.educationLevel !== undefined) {
      await this.educationLevelInput.fill(data.educationLevel);
    }
    if (data.occupation !== undefined) {
      await this.occupationInput.fill(data.occupation);
    }
    if (data.emergencyContact !== undefined) {
      await this.emergencyContactInput.fill(data.emergencyContact);
    }
    if (data.emergencyPhone !== undefined) {
      await this.emergencyPhoneInput.fill(data.emergencyPhone);
    }
  }

  async fillSpiritualInformation(data: SpiritualInfoData): Promise<void> {
    await this.goToSpiritualTab();
    if (data.membershipStatusId !== undefined) {
      await this.membershipStatusSelect.selectOption(data.membershipStatusId);
    }
    if (data.spiritualLevelId !== undefined) {
      await this.spiritualLevelSelect.selectOption(data.spiritualLevelId);
    }
    if (data.isActive !== undefined) {
      await this.isActiveSelect.selectOption(String(data.isActive));
    }
    if (data.isConverted !== undefined) {
      await this.isConvertedSelect.selectOption(String(data.isConverted));
    }
    if (data.conversionDate !== undefined) {
      await this.conversionDateInput.fill(data.conversionDate);
    }
    if (data.conversionChurch !== undefined) {
      await this.conversionChurchInput.fill(data.conversionChurch);
    }
    if (data.isBaptized !== undefined) {
      await this.isBaptizedSelect.selectOption(String(data.isBaptized));
    }
    if (data.baptismDate !== undefined) {
      await this.baptismDateInput.fill(data.baptismDate);
    }
    if (data.baptismChurch !== undefined) {
      await this.baptismChurchInput.fill(data.baptismChurch);
    }
    if (data.restorationDate !== undefined) {
      await this.restorationDateInput.fill(data.restorationDate);
    }
    if (data.restorationNote !== undefined) {
      await this.restorationNoteInput.fill(data.restorationNote);
    }
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  async clickPrevious(): Promise<void> {
    await this.previousButton.click();
  }

  async submitCreate(): Promise<void> {
    await this.createMemberButton.click();
    await this.modalContainer.waitFor({ state: 'detached', timeout: 10000 });
  }

  async submitEdit(): Promise<void> {
    await this.saveChangesButton.click();
    await this.modalContainer.waitFor({ state: 'detached', timeout: 10000 });
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
    await this.modalContainer.waitFor({ state: 'detached', timeout: 10000 });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.modalContainer.waitFor({ state: 'detached', timeout: 10000 });
  }
}
