import membersPoolData from './members.pool.json';
import { MemberPoolData, GeneratedMemberData } from './memberData.types';
import { CreateMemberRequest } from '../api/models/members.model';
import { scenarioContext } from '../context/scenarioContext';

/**
 * Data reader and generator for creating realistic test members
 * using randomized pools and strict chronological rules.
 */
export class MemberDataReader {
  private static pool: MemberPoolData = membersPoolData as MemberPoolData;

  /**
   * Helper to pick a random item from any string array
   */
  private static pickRandom<T>(items: T[]): T {
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }

  /**
   * Helper to remove accents/special characters for clean email generation
   */
  private static sanitizeForEmail(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  /**
   * Generates a 9-digit random phone number (standard Peruvian mobile format: 9XXXXXXXX)
   */
  static generateRandomPhone(): string {
    const randomEightDigits = Math.floor(10000000 + Math.random() * 90000000);
    return `9${randomEightDigits}`;
  }

  /**
   * Generates three chronological dates fulfilling: birthDate < conversionDate < baptismDate
   * - birthDate: Between 18 and 60 years ago
   * - conversionDate: At least 12 years after birthDate
   * - baptismDate: 1 to 3 years after conversionDate (prior to current date)
   */
  static generateChronologicalDates(): {
    birthDate: string;
    conversionDate: string;
    baptismDate: string;
  } {
    const now = new Date();
    const currentYear = now.getFullYear();

    // 1. Calculate birthDate (age between 18 and 60)
    const age = Math.floor(18 + Math.random() * 42); // 18 to 59
    const birthYear = currentYear - age;
    const birthMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const birthDay = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
    const birthDate = `${birthYear}-${birthMonth}-${birthDay}`;

    // 2. Calculate conversionDate (at least 12 years after birth, and at least 2 years before now)
    const minConversionAge = 12;
    const maxConversionAge = Math.max(minConversionAge + 1, age - 2);
    const conversionAge = Math.floor(
      minConversionAge + Math.random() * (maxConversionAge - minConversionAge + 1)
    );
    const conversionYear = birthYear + conversionAge;
    const conversionMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const conversionDay = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
    const conversionDate = `${conversionYear}-${conversionMonth}-${conversionDay}`;

    // 3. Calculate baptismDate (between a few months and 2 years after conversion, but not exceeding current year)
    let baptismYear = conversionYear + Math.floor(1 + Math.random() * 2);
    if (baptismYear > currentYear) {
      baptismYear = currentYear;
    }
    const baptismMonth = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
    const baptismDay = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0');
    const baptismDate = `${baptismYear}-${baptismMonth}-${baptismDay}`;

    return { birthDate, conversionDate, baptismDate };
  }

  /**
   * Generates a complete member dataset randomly selected from the pool
   * adhering strictly to user rules:
   * - firstName: <randomName> TEST_AT_<timestamp> (allows DB cleanup)
   * - lastName: random from pool
   * - surName: random from pool (second last name)
   * - emailAddress: [firstName].[lastName].[timestamp]@gmail.com
   * - phoneNumber: random 9 digits
   * - birthDate < conversionDate < baptismDate
   */
  static generateRandomMember(): GeneratedMemberData {
    const timestamp = Date.now();
    const baseName = this.pickRandom(this.pool.name);
    const lastName = this.pickRandom(this.pool.lastName);
    const surName = this.pickRandom(this.pool.lastName);
    const homeAddress = this.pickRandom(this.pool.homeAddress);
    const occupation = this.pickRandom(this.pool.occupation);
    const educationLevel = this.pickRandom(this.pool.educationLevel);
    const church = this.pickRandom(this.pool.church);

    const firstName = `${baseName} TEST_AT_${timestamp}`;
    const cleanFirstName = this.sanitizeForEmail(baseName);
    const cleanLastName = this.sanitizeForEmail(lastName);
    const emailAddress = `${cleanFirstName}.${cleanLastName}.${timestamp}@gmail.com`;
    const phoneNumber = this.generateRandomPhone();

    const { birthDate, conversionDate, baptismDate } = this.generateChronologicalDates();

    // Dynamically retrieve catalog IDs from scenarioContext (populated via ApiClient in beforeAll)
    const genderId = scenarioContext.getRandomGenderId(1);
    const maritalStatusId = scenarioContext.getRandomMaritalStatusId(1);
    const membershipStatusId = scenarioContext.getRandomMembershipStatusId(1);
    const spiritualLevelId = scenarioContext.getRandomSpiritualLevelId(1);

    return {
      firstName,
      lastName,
      surName,
      emailAddress,
      phoneNumber,
      homeAddress,
      occupation,
      educationLevel,
      church,
      birthDate,
      conversionDate,
      baptismDate,
      genderId,
      maritalStatusId,
      membershipStatusId,
      spiritualLevelId,
    };
  }

  /**
   * Generates a ready-to-use CreateMemberRequest payload with randomized pool data
   * and chronological dates.
   *
   * @param overrides - Optional fields to override on demand
   */
  static generateRandomPayload(
    overrides?: Partial<CreateMemberRequest>
  ): CreateMemberRequest {
    const member = this.generateRandomMember();

    return {
      firstName: member.firstName,
      lastName: member.lastName,
      surName: member.surName,
      emailAddress: member.emailAddress,
      phoneNumber: member.phoneNumber,
      homeAddress: member.homeAddress,
      occupation: member.occupation,
      educationLevel: member.educationLevel,
      conversionChurch: member.church,
      baptismChurch: member.church,
      birthDate: member.birthDate,
      conversionDate: member.conversionDate,
      baptismDate: member.baptismDate,
      genderId: member.genderId,
      maritalStatusId: member.maritalStatusId,
      membershipStatusId: member.membershipStatusId,
      spiritualLevelId: member.spiritualLevelId,
      isActive: true,
      isConverted: true,
      isBaptized: true,
      isDeleted: false,
      ...overrides,
    };
  }

  /**
   * Retrieves the raw pool data
   */
  static getPool(): MemberPoolData {
    return { ...this.pool };
  }
}
