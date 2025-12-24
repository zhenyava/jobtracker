import { z } from 'zod';

export const createApplicationSchema = z.object({
  profileId: z.string().uuid("Profile ID is required"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  jobUrl: z.string().url("Invalid Job URL"),
  description: z.string().min(1, "Job description is required"),
  location: z.string().optional(),
  workType: z.enum(['remote', 'office', 'hybrid'], {
    errorMap: () => ({ message: "Work type must be 'remote', 'office', or 'hybrid'" })
  } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
});

export type CreateApplicationPayload = z.infer<typeof createApplicationSchema>;
