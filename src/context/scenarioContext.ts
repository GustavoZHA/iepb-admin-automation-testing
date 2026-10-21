import { ApiClient } from '../api/apiClient';
import { MembersClient } from '../api/clients/membersClient';
import { LookupsClient } from '../api/clients/lookupsClient';
import { logger } from '../utils/logger';

export interface LookupStore {
  genderIds: number[];
  maritalStatusIds: number[];
  membershipStatusIds: number[];
  spiritualLevelIds: number[];
}

/**
 * Singleton context that holds scenario and catalog state fetched during test setup.
 * Uses the centralized ApiClient and validates HTTP 200 OK status codes on all catalog requests.
 */
export class ScenarioContext {
  private static instance: ScenarioContext;

  private lookups: LookupStore = {
    genderIds: [],
    maritalStatusIds: [],
    membershipStatusIds: [],
    spiritualLevelIds: [],
  };

  private constructor() {}

  public static getInstance(): ScenarioContext {
    if (!ScenarioContext.instance) {
      ScenarioContext.instance = new ScenarioContext();
    }
    return ScenarioContext.instance;
  }

  /**
   * Helper to safely extract integer IDs from either raw arrays or { data: [...] } responses
   */
  private extractIds(body: any): number[] {
    if (!body) return [];
    const list = Array.isArray(body)
      ? body
      : Array.isArray(body.data)
      ? body.data
      : [];

    return list
      .map((item: any) => item?.id ?? item?.Id)
      .filter((id: any): id is number => typeof id === 'number');
  }

  /**
   * Fetches and validates all lookup catalogs using the centralized ApiClient.
   * Enforces HTTP 200 OK validation for all endpoints.
   *
   * @param apiClient - The centralized ApiClient instance
   */
  public async loadFromApiClient(apiClient: ApiClient): Promise<LookupStore> {
    const membersClient = new MembersClient(apiClient);
    const lookupsClient = new LookupsClient(apiClient);

    // 1. Send GET requests through domain clients
    const [gendersRes, maritalRes, membershipRes, spiritualRes] = await Promise.all([
      membersClient.getGenders(),
      lookupsClient.getMaritalStatuses(),
      lookupsClient.getMembershipStatuses(),
      lookupsClient.getSpiritualLevels(),
    ]);

    // 2. Validate HTTP 200 OK status code on all responses
    const responses = [
      { name: 'Genders', endpoint: '/api/members/lookups/genders', res: gendersRes },
      { name: 'MaritalStatuses', endpoint: '/api/lookups/marital-statuses', res: maritalRes },
      { name: 'MembershipStatuses', endpoint: '/api/lookups/membership-statuses', res: membershipRes },
      { name: 'SpiritualLevels', endpoint: '/api/lookups/spiritual-levels', res: spiritualRes },
    ];

    for (const item of responses) {
      const status = item.res.status();
      if (status !== 200) {
        throw new Error(
          `Catalog request [${item.name}] to ${item.endpoint} failed. Expected HTTP 200 OK but received ${status}`
        );
      }
    }

    // 3. Parse and extract IDs from validated responses
    const genderIds = this.extractIds(await gendersRes.json());
    const maritalStatusIds = this.extractIds(await maritalRes.json());
    const membershipStatusIds = this.extractIds(await membershipRes.json());
    const spiritualLevelIds = this.extractIds(await spiritualRes.json());

    this.setLookups({
      genderIds,
      maritalStatusIds,
      membershipStatusIds,
      spiritualLevelIds,
    });

    logger.info(
      `ScenarioContext initialized successfully via ApiClient (all HTTP 200 OK) -> Genders: [${genderIds}], MaritalStatuses: [${maritalStatusIds}], MembershipStatuses: [${membershipStatusIds}], SpiritualLevels: [${spiritualLevelIds}]`
    );

    return this.lookups;
  }

  public setLookups(data: Partial<LookupStore>): void {
    if (data.genderIds && data.genderIds.length > 0) this.lookups.genderIds = [...data.genderIds];
    if (data.maritalStatusIds && data.maritalStatusIds.length > 0) this.lookups.maritalStatusIds = [...data.maritalStatusIds];
    if (data.membershipStatusIds && data.membershipStatusIds.length > 0) this.lookups.membershipStatusIds = [...data.membershipStatusIds];
    if (data.spiritualLevelIds && data.spiritualLevelIds.length > 0) this.lookups.spiritualLevelIds = [...data.spiritualLevelIds];
  }

  public getLookups(): LookupStore {
    return { ...this.lookups };
  }

  public isInitialized(): boolean {
    return (
      this.lookups.genderIds.length > 0 &&
      this.lookups.maritalStatusIds.length > 0 &&
      this.lookups.membershipStatusIds.length > 0 &&
      this.lookups.spiritualLevelIds.length > 0
    );
  }

  public getRandomGenderId(fallback = 1): number {
    return this.pickRandom(this.lookups.genderIds, fallback);
  }

  public getRandomMaritalStatusId(fallback = 1): number {
    return this.pickRandom(this.lookups.maritalStatusIds, fallback);
  }

  public getRandomMembershipStatusId(fallback = 1): number {
    return this.pickRandom(this.lookups.membershipStatusIds, fallback);
  }

  public getRandomSpiritualLevelId(fallback = 1): number {
    return this.pickRandom(this.lookups.spiritualLevelIds, fallback);
  }

  private pickRandom(items: number[], fallback: number): number {
    if (!items || items.length === 0) return fallback;
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }

  public clear(): void {
    this.lookups = {
      genderIds: [],
      maritalStatusIds: [],
      membershipStatusIds: [],
      spiritualLevelIds: [],
    };
  }
}

export const scenarioContext = ScenarioContext.getInstance();
