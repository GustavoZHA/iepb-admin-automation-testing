export interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  surName?: string | null;
  genderId: number;
  birthDate?: string | null; // YYYY-MM-DD
  maritalStatusId?: number | null;
  emailAddress?: string | null;
  phoneNumber?: string | null;
  homeAddress?: string | null;
  occupation?: string | null;
  educationLevel?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  isDeleted?: boolean;
  membershipStatusId?: number | null;
  membershipStatus?: string | null;
  spiritualLevelId?: number | null;
  isActive?: boolean | null;
  isConverted?: boolean | null;
  conversionDate?: string | null;
  conversionChurch?: string | null;
  isBaptized?: boolean | null;
  baptismDate?: string | null;
  baptismChurch?: string | null;
  restorationDate?: string | null;
  restorationNote?: string | null;
}

export interface UpdateMemberCommandRequest {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  surName?: string | null;
  genderId?: number | null;
  birthDate?: string | null;
  maritalStatusId?: number | null;
  emailAddress?: string | null;
  phoneNumber?: string | null;
  homeAddress?: string | null;
  occupation?: string | null;
  educationLevel?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  isDeleted?: boolean | null;
  membershipStatusId?: number | null;
  membershipStatus?: string | null;
  spiritualLevelId?: number | null;
  isActive?: boolean | null;
  isConverted?: boolean | null;
  conversionDate?: string | null;
  conversionChurch?: string | null;
  isBaptized?: boolean | null;
  baptismDate?: string | null;
  baptismChurch?: string | null;
  restorationDate?: string | null;
  restorationNote?: string | null;
}

export interface MemberDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  surName: string | null;
  genderId: number;
  birthDate: string | null;
  maritalStatusId: number | null;
  maritalStatusName?: string | null;
  emailAddress: string | null;
  phoneNumber: string | null;
  homeAddress: string | null;
  occupation: string | null;
  educationLevel: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  membershipStatusId?: number | null;
  membershipStatusCode?: string | null;
  membershipStatusName?: string | null;
  membershipStatus?: string | null;
  spiritualLevelId?: number | null;
  spiritualLevelCode?: string | null;
  spiritualLevelName?: string | null;
  isActive?: boolean | null;
  isConverted?: boolean;
  conversionDate?: string | null;
  conversionChurch?: string | null;
  isBaptized?: boolean;
  baptismDate?: string | null;
  baptismChurch?: string | null;
  restorationDate?: string | null;
  restorationNote?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors?: string[] | null;
}

export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string | null;
  data: T[];
  pagination: PaginationMetadata;
  errors?: string[] | null;
}

export interface PagedRequest {
  pageNumber: number;
  pageSize: number;
  filters: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  sorts: Array<{
    field: string;
    descending: boolean;
  }>;
}
