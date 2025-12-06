import z from 'zod';
import { AvailableLoanValidations } from './AvailableLoan.validation';

export type TAvailableLoanCreateArgs = z.infer<
  typeof AvailableLoanValidations.create
>['body'];

export type TAvailableLoanUpdateArgs = z.infer<
  typeof AvailableLoanValidations.update
>['body'];

export type TAvailableLoanDeleteArgs = z.infer<
  typeof AvailableLoanValidations.delete
>['body'];
