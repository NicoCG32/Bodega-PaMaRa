import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseProperties, releaseConfig, verifyArtifact } from './android-release.mjs';

function fixture() {
  const digest = 'ab'.repeat(32);
  return {
    config: { applicationId: 'test.app', versionName: '0.1.0-beta.1', versionCode: '1', minSdk: '26', targetSdk: '36' },
    metadata: { applicationId: 'test.app', elements: [{ versionName: '0.1.0-beta.1', versionCode: 1, filters: [] }] },
    badging: "package: name='test.app' versionCode='1' versionName='0.1.0-beta.1'\nminSdkVersion:'26'\ntargetSdkVersion:'36'",
    signature: `Signer #1 certificate SHA-256 digest: ${digest}`,
    assetlinks: [{ relation: ['delegate_permission/common.handle_all_urls'], target: { namespace: 'android_app', package_name: 'test.app', sha256_cert_fingerprints: [digest.toUpperCase().match(/.{2}/g).join(':')] } }],
  };
}

test('parses release configuration with Windows line endings', () => {
  assert.deepEqual(parseProperties('# comment\r\nversionCode=1\r\n'), { versionCode: '1' });
});
test('accepts a signed universal release with matching domain certificate', () => {
  assert.equal(verifyArtifact(fixture()), 'AB:'.repeat(31) + 'AB');
});
test('rejects a different signing key', () => {
  const data = fixture(); data.signature = `Signer #1 certificate SHA-256 digest: ${'cd'.repeat(32)}`;
  assert.throws(() => verifyArtifact(data), /certificate does not match/);
});
test('rejects an APK with a mismatched version', () => {
  const data = fixture(); data.metadata.elements[0].versionCode = 2;
  assert.throws(() => verifyArtifact(data), /versionCode/);
});
test('rejects a debuggable binary and a debug signing key', () => {
  const data = fixture(); data.badging += '\napplication-debuggable';
  assert.throws(() => verifyArtifact(data), /debuggable/);
  const key = fixture(); key.signature += '\nSigner #1 certificate DN: CN=Android Debug';
  assert.throws(() => verifyArtifact(key), /debug signing/);
});
test('rejects an unsigned APK and ABI-specific output', () => {
  assert.throws(() => verifyArtifact({ ...fixture(), signature: '' }), /No verified/);
  const data = fixture(); data.metadata.elements[0].filters = [{ filterType: 'ABI', value: 'arm64-v8a' }];
  assert.throws(() => verifyArtifact(data), /ABI-specific/);
});
test('rejects an unexpected minimum Android version', () => {
  const data = fixture(); data.badging = data.badging.replace("minSdkVersion:'26'", "minSdkVersion:'28'");
  assert.throws(() => verifyArtifact(data), /minimum Android/);
});
test('CI overrides version without changing the stable application identity', () => {
  const config = releaseConfig('applicationId=test.app\nversionCode=1\nversionName=0.1.0-beta.1', {
    ANDROID_VERSION_CODE: '1001', ANDROID_VERSION_NAME: '0.1.0-beta.1001',
  });
  assert.equal(config.versionCode, '1001');
  assert.equal(config.versionName, '0.1.0-beta.1001');
  assert.equal(config.applicationId, 'test.app');
});
test('refuses invalid version codes and accidental stable autopublication', () => {
  const text = 'versionCode=1\nversionName=0.1.0-beta.1';
  for (const code of ['0', '-1', '2100000001', '1.5']) {
    assert.throws(() => releaseConfig(text, { ANDROID_VERSION_CODE: code }), /versionCode/);
  }
  assert.throws(() => releaseConfig(text, { ANDROID_VERSION_NAME: '1.0.0' }), /only distributes beta/);
});
