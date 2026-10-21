import { DbClient } from '../dbClient';
import { logger } from '../../utils/logger';

/**
 * Safely removes a member and all child relational records from SQL Server
 */
export async function deleteMemberById(db: DbClient, memberId: string): Promise<void> {
  if (!memberId) return;

  const childQueries = [
    `DELETE FROM MemberSpiritualEvents WHERE MemberId = '${memberId}'`,
    `DELETE FROM MemberSpiritualJourneys WHERE MemberId = '${memberId}'`,
    `DELETE FROM MembershipMovements WHERE MemberId = '${memberId}'`,
    `DELETE FROM Memberships WHERE MemberId = '${memberId}'`,
    `DELETE FROM MemberRelationships WHERE FromMemberId = '${memberId}' OR ToMemberId = '${memberId}'`,
    `DELETE FROM Marriages WHERE HusbandId = '${memberId}' OR WifeId = '${memberId}'`,
    `DELETE FROM MinistryMembers WHERE MemberId = '${memberId}'`,
    `DELETE FROM Members WHERE ID = '${memberId}'`,
  ];

  for (const sql of childQueries) {
    try {
      await db.execute(sql);
    } catch (error) {
      logger.warn(`Teardown warning on query [${sql}]: ${(error as Error).message}`);
    }
  }
}

/**
 * Removes all members whose names or emails match the automated test prefix
 */
export async function cleanTestMembers(db: DbClient, prefix = 'TEST_AUT_'): Promise<void> {
  try {
    const testMembers = await db.query<{ ID: string }>(
      `SELECT ID FROM Members 
       WHERE FirstName LIKE '${prefix}%' 
          OR FirstName LIKE '%TEST_AT_%'
          OR SurName LIKE '%TEST_AT_%'
          OR EmailAddress LIKE '${prefix.toLowerCase()}%'
          OR EmailAddress LIKE '%test_at_%'`
    );

    if (testMembers && testMembers.length > 0) {
      logger.info(`Cleaning up ${testMembers.length} test member records from database...`);
      for (const m of testMembers) {
        await deleteMemberById(db, m.ID);
      }
      logger.info('Test members cleanup completed successfully.');
    }
  } catch (error) {
    logger.warn(`Failed to execute cleanTestMembers: ${(error as Error).message}`);
  }
}
