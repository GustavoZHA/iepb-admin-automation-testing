import { CreateMemberRequest, UpdateMemberCommandRequest } from '../models/members.model';
import { MemberDataReader } from '../../data/memberDataReader';

/**
 * Creates a complete Member creation payload populated from members.pool.json,
 * allowing any field to be overridden on the fly using Partial<CreateMemberRequest>.
 */
export function buildMemberPayload(overrides?: Partial<CreateMemberRequest>): CreateMemberRequest {
  return MemberDataReader.generateRandomPayload(overrides);
}

/**
 * Creates a minimal valid Member creation payload using random values from members.pool.json
 * with only mandatory fields.
 */
export function buildMinimalMemberPayload(overrides?: Partial<CreateMemberRequest>): CreateMemberRequest {
  const member = MemberDataReader.generateRandomMember();
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    genderId: 1,
    ...overrides,
  };
}

/**
 * Creates a Member creation payload populated from random sample test data pool.
 */
export function buildRandomMemberPayload(overrides?: Partial<CreateMemberRequest>): CreateMemberRequest {
  return MemberDataReader.generateRandomPayload(overrides);
}

/**
 * Creates a Member update payload, allowing any field to be overridden via Partial<UpdateMemberCommandRequest>.
 */
export function buildMemberUpdatePayload(overrides?: Partial<UpdateMemberCommandRequest>): UpdateMemberCommandRequest {
  return {
    phoneNumber: '999-8888',
    occupation: 'Senior Automation Engineer',
    homeAddress: 'Calle Nueva 456',
    ...overrides,
  };
}

/**
 * Creates a randomized Member update payload using pool data and scenario context lookups.
 */
export function buildRandomMemberUpdatePayload(overrides?: Partial<UpdateMemberCommandRequest>): UpdateMemberCommandRequest {
  const member = MemberDataReader.generateRandomMember();
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    surName: member.surName,
    phoneNumber: member.phoneNumber,
    homeAddress: member.homeAddress,
    occupation: member.occupation,
    educationLevel: member.educationLevel,
    conversionChurch: member.church,
    baptismChurch: member.church,
    maritalStatusId: member.maritalStatusId,
    membershipStatusId: member.membershipStatusId,
    spiritualLevelId: member.spiritualLevelId,
    ...overrides,
  };
}

/**
 * Fluent builder class leveraging Partial<T> for chaining.
 */
export class MemberBuilder {
  private payload: CreateMemberRequest;

  constructor(initial?: Partial<CreateMemberRequest>) {
    this.payload = buildMemberPayload(initial);
  }

  static aMember(overrides?: Partial<CreateMemberRequest>): MemberBuilder {
    return new MemberBuilder(overrides);
  }

  static aMinimalMember(overrides?: Partial<CreateMemberRequest>): MemberBuilder {
    const builder = new MemberBuilder();
    builder.payload = buildMinimalMemberPayload(overrides);
    return builder;
  }

  static fromRandomData(overrides?: Partial<CreateMemberRequest>): MemberBuilder {
    const builder = new MemberBuilder();
    builder.payload = buildRandomMemberPayload(overrides);
    return builder;
  }

  with(overrides: Partial<CreateMemberRequest>): this {
    this.payload = { ...this.payload, ...overrides };
    return this;
  }

  withoutFirstName(): this {
    this.payload.firstName = '';
    return this;
  }

  withoutLastName(): this {
    this.payload.lastName = '';
    return this;
  }

  build(): CreateMemberRequest {
    return { ...this.payload };
  }
}

/**
 * Fluent builder class for updates leveraging Partial<UpdateMemberCommandRequest>.
 */
export class MemberUpdateBuilder {
  private payload: UpdateMemberCommandRequest;

  constructor(initial?: Partial<UpdateMemberCommandRequest>) {
    this.payload = buildMemberUpdatePayload(initial);
  }

  static anUpdate(overrides?: Partial<UpdateMemberCommandRequest>): MemberUpdateBuilder {
    return new MemberUpdateBuilder(overrides);
  }

  static fromRandomData(overrides?: Partial<UpdateMemberCommandRequest>): MemberUpdateBuilder {
    const builder = new MemberUpdateBuilder();
    builder.payload = buildRandomMemberUpdatePayload(overrides);
    return builder;
  }

  with(overrides: Partial<UpdateMemberCommandRequest>): this {
    this.payload = { ...this.payload, ...overrides };
    return this;
  }

  build(): UpdateMemberCommandRequest {
    return { ...this.payload };
  }
}
