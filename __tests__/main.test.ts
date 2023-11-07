/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as exec from '@actions/exec';
// @ts-ignore
import { mockInputs } from './mock-inputs';
import { run } from '../src/main';
import * as io from '@actions/io';

describe('deploy app', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(io, 'which').mockImplementation(async () => {
      return Promise.resolve('/user/bin/az');
    });
    jest
      .spyOn(exec, 'exec')
      .mockImplementation(async (azPath, arg, options) => {
        if (arg && arg[1] === 'list') {
          options &&
            options.listeners &&
            options.listeners.stdout &&
            options.listeners.stdout(
              Buffer.from('[{"name":"test-app", "resourceGroup":"test-rg"}]')
            );
        }
        return Promise.resolve(0);
      });
  });
  it.each([
    ['function', 'functionapp'],
    ['api', 'webapp']
  ])(
    'should make az cli call to get %s app name and resource group with %s command',
    async (appType: string, appCommand: string) => {
      const mock = jest.spyOn(exec, 'exec');
      mockInputs(
        'tms',
        'product',
        '123',
        'dev',
        'ndt',
        'north europe',
        appType
      );

      await run();

      expect(mock).toHaveBeenCalledWith(
        '"/user/bin/az"',
        [
          appCommand,
          'list',
          '--query',
          "[?tags.tag_application=='product'&&tags.tag_pillar_code=='tms'&&tags.tag_instance_code=='ndt'&&location=='north europe'].{name: name, resourceGroup: resourceGroup}",
          '--subscription',
          '123',
          '--output',
          'json'
        ],
        { listeners: { stdout: expect.any(Function) }, silent: false }
      );
    }
  );

  it.each([
    ['function', 'functionapp'],
    ['api', 'webapp']
  ])(
    'should stage %s with %s command',
    async (appType: string, appCommand: string) => {
      const mock = jest.spyOn(exec, 'exec');
      mockInputs(
        'tms',
        'product',
        '123',
        'dev',
        'ndt',
        'north europe',
        appType
      );

      await run();
      expect(mock).toHaveBeenCalledWith(
        '"/user/bin/az"',
        [
          appCommand,
          'deployment',
          'source',
          'config-zip',
          '-n',
          'test-app',
          '-g',
          'test-rg',
          '--slot',
          'staging',
          '--src',
          './app.zip',
          '--subscription',
          '123'
        ],
        { listeners: { stdout: expect.any(Function) }, silent: false }
      );
    }
  );

  it.each([
    ['function', 'functionapp'],
    ['api', 'webapp']
  ])(
    'should swap %s with %s command',
    async (appType: string, appCommand: string) => {
      const mock = jest.spyOn(exec, 'exec');
      mockInputs(
        'tms',
        'product',
        '123',
        'dev',
        'ndt',
        'north europe',
        appType
      );

      await run();

      expect(mock).toHaveBeenCalledWith(
        '"/user/bin/az"',
        [
          appCommand,
          'deployment',
          'slot',
          'swap',
          '-n',
          'test-app',
          '-g',
          'test-rg',
          '--slot',
          'staging',
          '--subscription',
          '123'
        ],
        { listeners: { stdout: expect.any(Function) }, silent: false }
      );
    }
  );
});
