import { z } from 'zod';
import { EUserRole } from '../../../../prisma';
import { locationSchema } from '../trip/Trip.validation';
import { exists } from '../../../utils/db/exists';

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
      avatar: z.string().optional().nullable(),
      nid_number: z.string().optional(),
      payment_method: z.string().optional(),
    }),
  }),

  superEdit: z.object({
    body: z.object({
      is_active: z
        .string()
        .transform(val => val === 'true')
        .optional(),
      is_verified: z
        .string()
        .transform(val => val === 'true')
        .optional(),
      is_admin: z
        .string()
        .transform(val => val === 'true')
        .optional(),
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
      tab: z.enum(['users', 'drivers', 'pending_drivers']).default('users'),
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
    }),
  }),

  updateLocation: z.object({
    body: z.object({
      location: locationSchema,
    }),
  }),

  onesignalId: z.object({
    body: z.object({
      onesignal_id: z.string().nonempty('OneSignal ID is required'),
    }),
  }),

  approveUser: z.object({
    body: z.object({
      user_id: z.string().refine(exists('user'), {
        error: ({ input }) => `User with ID ${input} does not exist`,
      }),
    }),
  }),
};
