import * as core from '@actions/core';
import { getConfig } from './config';
import { getAppMetadata } from './get-app-metadata';
import { stage } from './stage';
import { swap } from './swap';

export async function run(): Promise<void> {
  try {
    const config = await getConfig();
    const app = await getAppMetadata(config);
    await stage(config, app);
    await swap(config, app);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
