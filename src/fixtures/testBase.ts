import { test as baseTest, expect } from '@playwright/test';
import { dbClient, DbClient } from '../db/dbClient';
import { ApiClient } from '../api/apiClient';
import { LookupsClient } from '../api/clients/lookupsClient';
import { MembersClient } from '../api/clients/membersClient';
import { MembersFamilyFacade } from '../api/facades/membersFamilyFacade';
import { MembersPage, MemberFormModal, MemberDetailModal, MemberRelationshipModal } from '../ui';

export type CustomFixtures = {
  db: DbClient;
  api: ApiClient;
  lookupsApi: LookupsClient;
  membersApi: MembersClient;
  familyFacade: MembersFamilyFacade;
  membersPage: MembersPage;
  memberFormModal: MemberFormModal;
  memberDetailModal: MemberDetailModal;
  memberRelationshipModal: MemberRelationshipModal;
};

export const test = baseTest.extend<CustomFixtures>({
  db: async ({}, use, testInfo) => {
    dbClient.setTestInfo(testInfo);
    await use(dbClient);
  },
  api: async ({ request }, use, testInfo) => {
    const apiClient = new ApiClient(request, testInfo);
    await use(apiClient);
  },
  lookupsApi: async ({ api }, use) => {
    const lookupsClient = new LookupsClient(api);
    await use(lookupsClient);
  },
  membersApi: async ({ api }, use) => {
    const membersClient = new MembersClient(api);
    await use(membersClient);
  },
  familyFacade: async ({ membersApi }, use) => {
    const familyFacade = new MembersFamilyFacade(membersApi);
    await use(familyFacade);
  },
  membersPage: async ({ page }, use) => {
    const membersPage = new MembersPage(page);
    await use(membersPage);
  },
  memberFormModal: async ({ page }, use) => {
    const memberFormModal = new MemberFormModal(page);
    await use(memberFormModal);
  },
  memberDetailModal: async ({ page }, use) => {
    const memberDetailModal = new MemberDetailModal(page);
    await use(memberDetailModal);
  },
  memberRelationshipModal: async ({ page }, use) => {
    const memberRelationshipModal = new MemberRelationshipModal(page);
    await use(memberRelationshipModal);
  },
});

export { expect };
