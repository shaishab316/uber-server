import chalk from 'chalk';
import { AdminServices } from '../src/app/modules/admin/Admin.service';
import { logger } from '../src/utils/logger';

logger.info(chalk.green('🔑 admin seed started...'));
AdminServices.seed().then(() =>
  logger.info(chalk.green('🔑 admin seed completed!')),
);
