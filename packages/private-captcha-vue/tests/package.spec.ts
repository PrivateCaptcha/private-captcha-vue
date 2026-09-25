// @vitest-environment node

import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const packageRoot = existsSync(join(process.cwd(), 'src/PrivateCaptcha.vue'))
  ? process.cwd()
  : join(process.cwd(), 'packages/private-captcha-vue');
const workspaceRoot = join(packageRoot, '../..');
const dist = join(packageRoot, 'dist');

describe('published package', () => {
  beforeAll(async () => {
    await execFileAsync('npm', ['run', 'build'], {
      cwd: packageRoot,
      env: { ...process.env, NODE_ENV: 'production' },
    });
  });

  it('loads named and default exports from ESM and CommonJS', async () => {
    const esm = await import(pathToFileURL(join(dist, 'index.js')).href);
    const cjs = createRequire(import.meta.url)(join(dist, 'index.cjs'));

    expect(esm.PrivateCaptcha).toBe(esm.default);
    expect(cjs.PrivateCaptcha).toBe(cjs.default);
  });

  it('includes declarations and only intended package paths', async () => {
    const declarations = await readFile(join(dist, 'index.d.ts'), 'utf8');
    const componentDeclarations = await readFile(
      join(dist, 'PrivateCaptcha.vue.d.ts'),
      'utf8',
    );
    const esmBundle = await readFile(join(dist, 'index.js'), 'utf8');
    const cjsBundle = await readFile(join(dist, 'index.cjs'), 'utf8');
    const packageJson = JSON.parse(
      await readFile(join(packageRoot, 'package.json'), 'utf8'),
    );
    const { stdout } = await execFileAsync(
      'npm',
      ['pack', '--dry-run', '--json'],
      { cwd: packageRoot },
    );
    const report = JSON.parse(stdout);
    const files = report[0].files.map((file: { path: string }) => file.path);

    expect(declarations).toContain('PrivateCaptcha');
    expect(declarations).not.toMatch(
      /PrivateCaptcha(DisplayMode|Language|Props|StartMode|Theme)/,
    );
    expect(componentDeclarations).not.toContain('ComponentProvideOptions');
    expect(esmBundle).not.toContain(packageRoot);
    expect(cjsBundle).not.toContain(packageRoot);
    expect(packageJson.peerDependencies.vue).toBe('^3.3.0');
    expect(files).toContain('dist/index.js');
    expect(files).toContain('dist/index.cjs');
    expect(files).toContain('dist/index.d.ts');
    expect(files).toContain('README.md');
    expect(files).toContain('LICENSE');
    expect(files.some((file: string) => file.startsWith('src/'))).toBe(false);
    expect(files.some((file: string) => file.includes('demo-app'))).toBe(false);
  });

  it('typechecks the public API against the minimum Vue version', async () => {
    const workspacePackageJson = JSON.parse(
      await readFile(join(workspaceRoot, 'package.json'), 'utf8'),
    );
    const consumerRoot = await mkdtemp(
      join(tmpdir(), 'private-captcha-vue-consumer-'),
    );
    const consumerSource = `
import PrivateCaptchaDefault, {
  PrivateCaptcha,
  type PrivateCaptchaEventDetail,
  type PrivateCaptchaExposed,
  type PrivateCaptchaWidget,
} from '@private-captcha/private-captcha-vue';

const sameComponent: typeof PrivateCaptcha = PrivateCaptchaDefault;
declare const detail: PrivateCaptchaEventDetail;
declare const exposed: PrivateCaptchaExposed;
declare const widget: PrivateCaptchaWidget;
declare const instance: InstanceType<typeof PrivateCaptcha>;

sameComponent;
exposed.execute();
exposed.reset();
exposed.solution();
exposed.element();
widget.execute();
instance.execute();
instance.$emit('finish', detail);
const props: typeof instance.$props = {
  siteKey: 'test-site-key',
  onFinish: (event) => event.widget.solution(),
};
props;
`;
    const consumerConfig = {
      compilerOptions: {
        baseUrl: consumerRoot,
        lib: ['DOM', 'ES2022'],
        module: 'ESNext',
        moduleResolution: 'Bundler',
        noEmit: true,
        paths: {
          '@private-captcha/private-captcha-vue': [
            join(dist, 'index.d.ts'),
          ],
        },
        skipLibCheck: false,
        strict: true,
        target: 'ES2022',
      },
      files: [join(consumerRoot, 'consumer.ts')],
    };

    try {
      await writeFile(join(consumerRoot, 'consumer.ts'), consumerSource);
      await writeFile(
        join(consumerRoot, 'tsconfig.json'),
        JSON.stringify(consumerConfig),
      );

      expect(workspacePackageJson.devDependencies.vue).toBe('3.3.0');
      await execFileAsync(
        process.execPath,
        [
          join(workspaceRoot, 'node_modules/typescript/bin/tsc'),
          '--project',
          join(consumerRoot, 'tsconfig.json'),
        ],
        { cwd: workspaceRoot },
      );
    } finally {
      await rm(consumerRoot, { recursive: true, force: true });
    }
  });
});
