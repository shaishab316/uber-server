import z from 'zod';
import { IntercityValidations } from './Intercity.validation';
import { TList } from '../query/Query.interface';

export type TCreateIntercity = z.infer<
  typeof IntercityValidations.createIntercity
>['body'] & { driver_id: string };

export type TUpdateIntercityStatus = z.infer<
  typeof IntercityValidations.updateIntercityStatus
>['body'] & { driver_id: string };

export type THandleJoinRequest = z.infer<
  typeof IntercityValidations.handleJoinRequest
>['body'] & { driver_id: string };

export type TGetIntercityRides = TList & {
  driver_id: string;
};

export type TFindNearbyIntercities = z.infer<
  typeof IntercityValidations.findNearby
>['query'] &
  TList;
