import { MembersClient } from '../clients/membersClient';
import { CreateMemberRequest } from '../models/members.model';

export interface FamilyMemberDefinition {
  role: 'abuelo' | 'abuela' | 'padre' | 'madre' | 'hijo1' | 'hijo2' | 'hija';
  firstName: string;
  lastName: string;
  surName: string;
  genderId: number;
  birthDate: string;
  homeAddress: string;
  phoneNumber: string;
  id?: string;
}

export interface FamilyTree {
  abuelo: FamilyMemberDefinition;
  abuela: FamilyMemberDefinition;
  padre: FamilyMemberDefinition;
  madre: FamilyMemberDefinition;
  hijo1: FamilyMemberDefinition;
  hijo2: FamilyMemberDefinition;
  hija: FamilyMemberDefinition;
  allMembers: FamilyMemberDefinition[];
  allIds: string[];
}

export class MembersFamilyFacade {
  constructor(private readonly membersApi: MembersClient) {}

  /**
   * Creates a structured, realistic multi-generational family tree:
   * Abuelo, Abuela, Padre (Papá), Madre (Mamá), dos Hijos y una Hija.
   * All names are clearly coded with cohesive surnames and traceability prefixes.
   */
  async createFamilyTree(): Promise<FamilyTree> {
    const timestamp = Date.now();

    const familyDefinitions: FamilyMemberDefinition[] = [
      {
        role: 'abuelo',
        firstName: `TEST_AUT_Roberto_${timestamp}`,
        lastName: 'Mendoza',
        surName: 'Alvarez',
        genderId: 0, // Masculino
        birthDate: '1945-04-12',
        homeAddress: 'Av. Las Palmas 100, Lima',
        phoneNumber: '911122334',
      },
      {
        role: 'abuela',
        firstName: `TEST_AUT_Carmen_${timestamp}`,
        lastName: 'Paredes',
        surName: 'Salazar',
        genderId: 1, // Femenino
        birthDate: '1948-08-20',
        homeAddress: 'Av. Las Palmas 100, Lima',
        phoneNumber: '911122335',
      },
      {
        role: 'padre',
        firstName: `TEST_AUT_Carlos_${timestamp}`,
        lastName: 'Mendoza',
        surName: 'Paredes',
        genderId: 0, // Masculino
        birthDate: '1972-03-15',
        homeAddress: 'Calle Los Pinos 742, Lima',
        phoneNumber: '922233445',
      },
      {
        role: 'madre',
        firstName: `TEST_AUT_Elena_${timestamp}`,
        lastName: 'Morales',
        surName: 'Rios',
        genderId: 1, // Femenino
        birthDate: '1975-11-25',
        homeAddress: 'Calle Los Pinos 742, Lima',
        phoneNumber: '922233446',
      },
      {
        role: 'hijo1',
        firstName: `TEST_AUT_Mateo_${timestamp}`,
        lastName: 'Mendoza',
        surName: 'Morales',
        genderId: 0, // Masculino
        birthDate: '1998-06-10',
        homeAddress: 'Calle Los Pinos 742, Lima',
        phoneNumber: '933344556',
      },
      {
        role: 'hijo2',
        firstName: `TEST_AUT_Lucas_${timestamp}`,
        lastName: 'Mendoza',
        surName: 'Morales',
        genderId: 0, // Masculino
        birthDate: '2002-09-18',
        homeAddress: 'Calle Los Pinos 742, Lima',
        phoneNumber: '933344557',
      },
      {
        role: 'hija',
        firstName: `TEST_AUT_Sofia_${timestamp}`,
        lastName: 'Mendoza',
        surName: 'Morales',
        genderId: 1, // Femenino
        birthDate: '2005-12-05',
        homeAddress: 'Calle Los Pinos 742, Lima',
        phoneNumber: '933344558',
      },
    ];

    const allIds: string[] = [];

    for (const member of familyDefinitions) {
      const payload: CreateMemberRequest = {
        firstName: member.firstName,
        lastName: member.lastName,
        surName: member.surName,
        genderId: member.genderId,
        birthDate: member.birthDate,
        homeAddress: member.homeAddress,
        phoneNumber: member.phoneNumber,
        emailAddress: `${member.firstName.toLowerCase()}.${member.lastName.toLowerCase()}@example.com`,
        maritalStatusId: member.role === 'abuelo' || member.role === 'abuela' || member.role === 'padre' || member.role === 'madre' ? 3 : 1, // Casado / Soltero
        isActive: true,
        isDeleted: false,
      };

      const response = await this.membersApi.create(payload);
      const body = await response.json();
      const createdId = body?.data?.id || body?.id;

      if (createdId) {
        member.id = createdId;
        allIds.push(createdId);
      }
    }

    const byRole = (role: FamilyMemberDefinition['role']) =>
      familyDefinitions.find((m) => m.role === role)!;

    return {
      abuelo: byRole('abuelo'),
      abuela: byRole('abuela'),
      padre: byRole('padre'),
      madre: byRole('madre'),
      hijo1: byRole('hijo1'),
      hijo2: byRole('hijo2'),
      hija: byRole('hija'),
      allMembers: familyDefinitions,
      allIds,
    };
  }
}
