import { z } from 'zod';

export const AvailableDriverValidations = {
  join: z.object({
    body: z.object({
      location: z.object({
        geo: z.tuple([
          z.coerce
            .number()
            .refine(
              long => long >= -180 && long <= 180,
              'Longitude must be between -180 and 180',
            ),
          z.coerce
            .number()
            .refine(
              lat => lat >= -90 && lat <= 90,
              'Latitude must be between -90 and 90',
            ),
        ]),
        address: z.coerce.string(),
      }),
    }),
  }),
};
