import fs from 'fs';
import axios from 'axios';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ensureUploadDirs } from '../app/middlewares/capture';
import { errorLogger, logger } from './logger';
import chalk from 'chalk';

ensureUploadDirs().catch(err =>
  errorLogger.error('Upload directory initialization failed:', err),
);

const imageDir = path.join(process.cwd(), 'uploads', 'images');

export async function downloadImage(url?: string | null) {
  if (!url) return;

  logger.info(chalk.green(`🔍 Downloading image from: ${url}`));
  try {
    await ensureUploadDirs();

    const fileName = `${uuidv4()}.png`;
    const destinationPath = path.join(imageDir, fileName);

    const response = await axios({
      url,
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(destinationPath);

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(true));
      writer.on('error', reject);
    });

    logger.info(
      chalk.green(`✅ Image downloaded successfully: ${destinationPath}`),
    );

    return `/images/${fileName}`;
  } catch (error) {
    logger.error(chalk.red('❎ Error downloading image:'), error);
  }
}
