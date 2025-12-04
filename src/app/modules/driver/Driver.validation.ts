import z from 'zod';

export const DriverValidations = {
  getEarnings: z.object({
    query: z.object({
      dateType: z
        .enum(['this_week', 'last_week', 'this_month', 'last_month'])
        .default('this_week'),
    }),
  }),
};
