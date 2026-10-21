import { z } from 'zod';

export const memberDtoSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  surName: z.string().nullable().optional(),
  genderId: z.number(),
  birthDate: z.string().nullable().optional(),
  maritalStatusId: z.number().nullable().optional(),
  maritalStatusName: z.string().nullable().optional(),
  emailAddress: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  homeAddress: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  educationLevel: z.string().nullable().optional(),
  emergencyContact: z.string().nullable().optional(),
  emergencyPhone: z.string().nullable().optional(),
  isDeleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable().optional(),
  deletedAt: z.string().nullable().optional(),
  membershipStatusId: z.number().nullable().optional(),
  membershipStatusCode: z.string().nullable().optional(),
  membershipStatusName: z.string().nullable().optional(),
  spiritualLevelId: z.number().nullable().optional(),
  spiritualLevelCode: z.string().nullable().optional(),
  spiritualLevelName: z.string().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
  isConverted: z.boolean().optional(),
  isBaptized: z.boolean().optional(),
}).passthrough();

export const apiMemberResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().nullable().optional(),
  data: memberDtoSchema.nullable().optional(),
  errors: z.array(z.string()).nullable().optional(),
});

export const apiMemberListResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().nullable().optional(),
  data: z.array(memberDtoSchema),
  pagination: z.object({
    currentPage: z.number(),
    pageSize: z.number(),
    totalItems: z.number(),
  }),
});

export const apiErrorResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().nullable().optional(),
  data: z.null().optional(),
  errors: z.array(z.string()).optional(),
});
