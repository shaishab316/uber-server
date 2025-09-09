import { z } from 'zod';
import { EUserRole } from '../../../../prisma';
import { enum_encode } from '../../../util/transform/enum';

export const UserValidations = {
  register: z.object({
    body: z.object({
      name: z
        .string({ error: 'Name is missing' })
        .trim()
        .nonempty('Name is required'),
      email: z.email({ error: 'Email is invalid' }).optional(),
      phone: z.string().optional(),
      password: z
        .string({ error: 'Password is missing' })
        .min(6, 'Password must be at least 6 characters long'),
    }),
  }),

  edit: z.object({
    body: z.object({
      email: z.email({ error: 'Email is invalid' }).optional(),
      phone: z.string().optional(),
      role: z.enum(EUserRole).optional(),
      name: z.string().optional(),
      avatar: z.string().optional(),
      nid_number: z.string().optional(),
      payment_method: z.string().optional(),
    }),
  }),

  changePassword: z.object({
    body: z.object({
      oldPassword: z
        .string({
          error: 'Old Password is missing',
        })
        .min(1, 'Old Password is required')
        .min(6, 'Old Password must be at least 6 characters long'),
      newPassword: z
        .string({
          error: 'New Password is missing',
        })
        .min(1, 'New Password is required')
        .min(6, 'New Password must be at least 6 characters long'),
    }),
  }),

  getAllUser: z.object({
    query: z.object({
      search: z.string().trim().optional(),
      role: z
        .string()
        .optional()
        .transform(enum_encode)
        .pipe(z.enum(EUserRole).optional()),
    }),
  }),

  applyForDriver: z.object({
    body: z.object({
      avatar: z
        .string({
          error: 'Avatar is missing',
        })
        .nonempty('Avatar is required'),
      driver_license: z
        .string({
          error: 'Driver License is missing',
        })
        .nonempty('Driver License is required'),
      car_photo: z
        .string({
          error: 'Car Photo is missing',
        })
        .nonempty('Car Photo is required'),
      car_name: z
        .string({
          error: 'Car Name is missing',
        })
        .nonempty('Car Name is required'),
      nid_number: z
        .string({
          error: 'NID Number is missing',
        })
        .nonempty('NID Number is required'),
      payment_method: z
        .string({
          error: 'Payment Method is missing',
        })
        .nonempty('Payment Method is required'),
      business_contact: z
        .string({
          error: 'Business Contact is missing',
        })
        .nonempty('Business Contact is required'),
    }),
  }),

  updateLocation: z.object({
    body: z.object({
      location: z.object({
        geo: z
          .tuple([
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
          ])
          .optional(),
        address: z.coerce.string().optional(),
      }),
    }),
  }),
};
