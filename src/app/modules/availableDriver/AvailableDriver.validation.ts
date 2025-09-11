import { z } from 'zod';
import { EVehicle } from '../../../../prisma';
import { enum_encode } from '../../../util/transform/enum';
import { locationSchema } from '../trip/Trip.validation';

export const AvailableDriverValidations = {
  join: z.object({
    body: z.object({
      location: locationSchema,
      vehicle: z.string().transform(enum_encode).pipe(z.enum(EVehicle)),
    }),
  }),
};
