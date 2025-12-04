import z from 'zod';
import { DriverValidations } from './Driver.validation';
import { TList } from '../query/Query.interface';

export type TGetEarningsArgs = z.infer<
  typeof DriverValidations.getEarnings
>['query'] &
  TList & { driver_id: string };
