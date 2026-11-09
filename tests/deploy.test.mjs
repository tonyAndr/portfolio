import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  chmod,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const deployScriptPath = path.join(projectRoot, 'deploy', 'deploy-image.sh');
const tagA = 'a'.repeat(40);
const tagB = 'b'.repeat(40);

async function makeHarness() {
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-deploy-test-'));
  const deployDir = path.join(root, 'deploy');
  const binDir = path.join(root, 'bin');
  await mkdir(deployDir);
  await mkdir(binDir);
  await writeFile(path.join(deployDir, 'compose.yml'), 'services: {}\n');

  const originalScript = await readFile(deployScriptPath, 'utf8');
  const harnessScript = originalScript.replace(
    'DEPLOY_DIR=/home/tony/docker/portfolio',
    `DEPLOY_DIR="${deployDir}"`,
  );
  assert.notEqual(
    harnessScript,
    originalScript,
    'deployment directory placeholder was not found',
  );
  const scriptPath = path.join(root, 'deploy-image.sh');
  await writeFile(scriptPath, harnessScript);
  await chmod(scriptPath, 0o700);

  const dockerPath = path.join(binDir, 'docker');
  await writeFile(
    dockerPath,
    `#!/bin/sh
	printf 'docker IMAGE=%s args=%s\\n' "\${IMAGE-<unset>}" "$*" >> "$MOCK_LOG"
if [ "$1" = load ] && [ "\${MOCK_DOCKER_LOAD_FAIL:-0}" = 1 ]; then exit 1; fi
if [ "$1" = compose ] && [ "$2" = -f ]; then
  shift 3
  if [ "$1" = up ] && [ "\${MOCK_UP_FAIL:-0}" = 1 ]; then exit 1; fi
fi
exit 0
`,
  );
  await chmod(dockerPath, 0o700);

  const curlPath = path.join(binDir, 'curl');
  await writeFile(
    curlPath,
    `#!/bin/sh
if [ "\${MOCK_CURL_FAIL:-0}" = 1 ]; then
  printf '%s' "\${MOCK_CURL_OUTPUT:-}"
  exit 22
fi
printf '%s' "\${MOCK_CURL_REVISION:-}"
`,
  );
  await chmod(curlPath, 0o700);

  const logPath = path.join(root, 'commands.log');
  const run = (command, extraEnv = {}) =>
    spawnSync('sh', [scriptPath], {
      cwd: root,
      input: gzipSync(Buffer.from('mock image archive')),
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${binDir}:${process.env.PATH}`,
        SSH_ORIGINAL_COMMAND: command,
        MOCK_LOG: logPath,
        ...extraEnv,
      },
    });

  return { root, deployDir, logPath, run };
}

async function readIfExists(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

test('rejects unsupported commands and malformed image tags before loading', async (t) => {
  const harness = await makeHarness();
  t.after(() => rm(harness.root, { recursive: true, force: true }));

  const unsupported = harness.run('shell');
  assert.notEqual(unsupported.status, 0);
  assert.match(unsupported.stderr, /unsupported command/);

  const maliciousTag = harness.run(`deploy ${'a'.repeat(39)};id`);
  assert.notEqual(maliciousTag.status, 0);
  assert.match(maliciousTag.stderr, /invalid image tag/);
  assert.equal(await readIfExists(harness.logPath), null);
});

test('successful deployment records current and previous image tags', async (t) => {
  const harness = await makeHarness();
  t.after(() => rm(harness.root, { recursive: true, force: true }));
  await writeFile(
    path.join(harness.deployDir, '.current-image'),
    `portfolio:${tagA}\n`,
  );

  const result = harness.run(`deploy ${tagB}`, { MOCK_CURL_REVISION: tagB });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    await readFile(path.join(harness.deployDir, '.current-image'), 'utf8'),
    `portfolio:${tagB}\n`,
  );
  assert.equal(
    await readFile(path.join(harness.deployDir, '.previous-image'), 'utf8'),
    `portfolio:${tagA}\n`,
  );
  const log = await readFile(harness.logPath, 'utf8');
  assert.match(
    log,
    new RegExp(`docker IMAGE=portfolio:${tagB} args=compose .* up -d --wait`),
  );
  assert.doesNotMatch(log, / args=compose .* down/);
});

test('failed version verification restores the previous image without changing pointers', async (t) => {
  const harness = await makeHarness();
  t.after(() => rm(harness.root, { recursive: true, force: true }));
  await writeFile(
    path.join(harness.deployDir, '.current-image'),
    `portfolio:${tagA}\n`,
  );
  await writeFile(
    path.join(harness.deployDir, '.previous-image'),
    `portfolio:${'c'.repeat(40)}\n`,
  );

  const result = harness.run(`deploy ${tagB}`, {
    MOCK_CURL_REVISION: 'wrong-revision',
  });

  assert.notEqual(result.status, 0);
  assert.equal(
    await readFile(path.join(harness.deployDir, '.current-image'), 'utf8'),
    `portfolio:${tagA}\n`,
  );
  assert.equal(
    await readFile(path.join(harness.deployDir, '.previous-image'), 'utf8'),
    `portfolio:${'c'.repeat(40)}\n`,
  );
  const log = await readFile(harness.logPath, 'utf8');
  assert.match(
    log,
    new RegExp(`docker IMAGE=portfolio:${tagA} args=compose .* up -d --wait`),
  );
});

test('failed initial deployment calls compose down with the candidate image set', async (t) => {
  const harness = await makeHarness();
  t.after(() => rm(harness.root, { recursive: true, force: true }));

  const result = harness.run(`deploy ${tagB}`, {
    MOCK_CURL_REVISION: 'wrong-revision',
  });

  assert.notEqual(result.status, 0);
  const log = await readFile(harness.logPath, 'utf8');
  assert.match(
    log,
    new RegExp(`docker IMAGE=portfolio:${tagB} args=compose .* down`),
  );
  assert.equal(
    await readIfExists(path.join(harness.deployDir, '.current-image')),
    null,
  );
});

test('image load failure leaves existing deployment pointers unchanged', async (t) => {
  const harness = await makeHarness();
  t.after(() => rm(harness.root, { recursive: true, force: true }));
  const oldPrevious = `portfolio:${'c'.repeat(40)}\n`;
  await writeFile(
    path.join(harness.deployDir, '.current-image'),
    `portfolio:${tagA}\n`,
  );
  await writeFile(path.join(harness.deployDir, '.previous-image'), oldPrevious);

  const result = harness.run(`deploy ${tagB}`, { MOCK_DOCKER_LOAD_FAIL: '1' });

  assert.notEqual(result.status, 0);
  assert.equal(
    await readFile(path.join(harness.deployDir, '.current-image'), 'utf8'),
    `portfolio:${tagA}\n`,
  );
  assert.equal(
    await readFile(path.join(harness.deployDir, '.previous-image'), 'utf8'),
    oldPrevious,
  );
  assert.doesNotMatch(
    await readFile(harness.logPath, 'utf8'),
    / args=compose /,
  );
});
