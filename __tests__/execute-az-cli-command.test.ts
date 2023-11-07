/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as exec from '@actions/exec';
import { executeAzCliCommand } from '../src/execute-az-cli-command';

describe('should set silent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it.each([true, false])('should set silent', async silent => {
    const mock = jest.spyOn(exec, 'exec').mockImplementation(async () => {
      return Promise.resolve(0);
    });

    await executeAzCliCommand('az', ['test'], silent);

    expect(mock).toHaveBeenCalledWith('"az"', ['test'], {
      listeners: { stdout: expect.any(Function) },
      silent
    });
  });

  it('should set silent to false if not given', async () => {
    const mock = jest.spyOn(exec, 'exec').mockImplementation(async () => {
      return Promise.resolve(0);
    });

    await executeAzCliCommand('az', ['test']);

    expect(mock).toHaveBeenCalledWith('"az"', ['test'], {
      listeners: { stdout: expect.any(Function) },
      silent: false
    });
  });
});
