import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => readFileSync(path.join(root, file), "utf8");
const run = (file, args) =>
  execFileSync(file, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function parseProperties(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.startsWith("#"))
      .map((line) => {
        const i = line.indexOf("=");
        assert(i > 0, "Invalid Android property");
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

export function releaseConfig(text, env = process.env) {
  const config = parseProperties(text);
  config.versionCode = env.ANDROID_VERSION_CODE ?? config.versionCode;
  config.versionName = env.ANDROID_VERSION_NAME ?? config.versionName;
  assert(
    /^[1-9][0-9]*$/.test(config.versionCode) && Number(config.versionCode) <= 2100000000,
    "Invalid Android versionCode",
  );
  assert(
    /^\d+\.\d+\.\d+-beta\.\d+$/.test(config.versionName),
    "This pipeline only distributes beta candidates",
  );
  return config;
}

export function manifestActivities(xmlTree) {
  const names = new Set();
  let activityIndent = null;
  for (const line of xmlTree.split(/\r?\n/)) {
    const element = line.match(/^(\s*)E: (\S+)/);
    if (element) {
      if (activityIndent !== null && element[1].length <= activityIndent) activityIndent = null;
      if (element[2] === "activity") activityIndent = element[1].length;
    }
    const attr = line.match(/^(\s*)A: [^\s]*:name\([^)]*\)="([^"]+)"/);
    if (attr && activityIndent !== null && attr[1].length === activityIndent + 2)
      names.add(attr[2]);
  }
  return names;
}

export function verifyArtifact({
  config,
  metadata,
  badging,
  signature,
  assetlinks,
  compiledManifest,
}) {
  assert.equal(metadata.applicationId, config.applicationId, "Unexpected application ID");
  assert.equal(metadata.elements.length, 1, "Expected one universal APK");
  const element = metadata.elements[0];
  assert.equal(element.versionName, config.versionName, "Unexpected versionName");
  assert.equal(element.versionCode, Number(config.versionCode), "Unexpected versionCode");
  assert.deepEqual(element.filters, [], "APK must not be ABI-specific");
  assert(!badging.includes("application-debuggable"), "Refusing a debuggable APK");
  assert(
    !badging.includes("native-code:"),
    "Unexpected native libraries; review ABI compatibility",
  );
  assert(
    badging.includes(
      `package: name='${config.applicationId}' versionCode='${config.versionCode}' versionName='${config.versionName}'`,
    ),
    "APK identity differs from configuration",
  );
  assert(
    badging.includes(`minSdkVersion:'${config.minSdk}'`),
    "Unexpected minimum Android version",
  );
  assert(badging.includes(`targetSdkVersion:'${config.targetSdk}'`), "Unexpected Android target");
  const activities = manifestActivities(compiledManifest);
  for (const name of ["LauncherActivity", "ManageDataLauncherActivity", "FocusActivity"]) {
    assert(
      activities.has(`com.google.androidbrowserhelper.trusted.${name}`),
      `APK is missing required TWA activity: ${name}`,
    );
  }
  const match = signature.match(/Signer #1 certificate SHA-256 digest: ([a-fA-F0-9]{64})/);
  assert(match, "No verified APK signing certificate");
  assert(!/CN=Android Debug/i.test(signature), "Refusing a debug signing certificate");
  const fingerprint = match[1].toUpperCase().match(/.{2}/g).join(":");
  assert(
    assetlinks.some(
      (entry) =>
        entry.relation?.includes("delegate_permission/common.handle_all_urls") &&
        entry.target?.namespace === "android_app" &&
        entry.target.package_name === config.applicationId &&
        entry.target.sha256_cert_fingerprints?.includes(fingerprint),
    ),
    "Signing certificate does not match assetlinks.json",
  );
  return fingerprint;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  for (const arg of args)
    assert(
      ["--allow-dirty", "--check-web", "--inspect-web"].includes(arg),
      `Unknown option: ${arg}`,
    );
  const config = releaseConfig(read("android/release.properties"));
  const status = run("git", ["status", "--porcelain"]).trim();
  const dirty = status.length > 0;
  assert(
    !dirty || args.has("--allow-dirty"),
    "Commit the reviewed source before packaging, or use --allow-dirty for local evaluation only",
  );
  const commit = run("git", ["rev-parse", "HEAD"]).trim();
  const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  assert(sdk, "Set ANDROID_HOME to the Android SDK");
  const java = process.env.JAVA_HOME
    ? path.join(process.env.JAVA_HOME, "bin", process.platform === "win32" ? "java.exe" : "java")
    : "java";
  const buildTools = path.join(sdk, "build-tools", config.buildToolsVersion);
  const apk = path.join(root, "android/app/build/outputs/apk/release/app-release.apk");
  assert(existsSync(apk), "Build the signed APK first: cd android && ./gradlew assembleRelease");
  const signature = run(java, [
    "-jar",
    path.join(buildTools, "lib/apksigner.jar"),
    "verify",
    "--verbose",
    "--print-certs",
    apk,
  ]);
  const badging = run(path.join(buildTools, process.platform === "win32" ? "aapt2.exe" : "aapt2"), [
    "dump",
    "badging",
    apk,
  ]);
  const compiledManifest = run(
    path.join(buildTools, process.platform === "win32" ? "aapt2.exe" : "aapt2"),
    ["dump", "xmltree", apk, "--file", "AndroidManifest.xml"],
  );
  const metadata = JSON.parse(read("android/app/build/outputs/apk/release/output-metadata.json"));
  const assetlinks = JSON.parse(read("public/.well-known/assetlinks.json"));
  const fingerprint = verifyArtifact({
    config,
    metadata,
    badging,
    signature,
    assetlinks,
    compiledManifest,
  });
  let domainVerification = "not-checked";
  if (args.has("--check-web") || args.has("--inspect-web")) {
    try {
      const response = await fetch(`https://${config.host}/.well-known/assetlinks.json`, {
        redirect: "error",
        signal: AbortSignal.timeout(20000),
      });
      assert.equal(response.status, 200, `Hosted assetlinks.json returned HTTP ${response.status}`);
      assert(
        response.headers.get("content-type")?.includes("application/json"),
        "assetlinks.json must be served as application/json",
      );
      verifyArtifact({
        config,
        metadata,
        badging,
        signature,
        assetlinks: await response.json(),
        compiledManifest,
      });
      domainVerification = "https-file-matches-certificate";
    } catch (error) {
      if (args.has("--check-web")) throw error;
      domainVerification = "pending-browser-toolbar-expected";
      console.warn(`Domain association pending: ${error.message}`);
    }
  }
  const name = `pamara-bodega-${config.versionName}${dirty ? "-local" : ""}.apk`;
  const out = path.join(root, "release-output", config.versionName + (dirty ? "-local" : ""));
  mkdirSync(out, { recursive: true });
  copyFileSync(apk, path.join(out, name));
  const bytes = readFileSync(apk);
  // Hash the exact Android inputs, even for an explicitly marked local evaluation.
  const inputs = run("git", [
    "ls-files",
    "--cached",
    "--others",
    "--exclude-standard",
    "-z",
    "android",
    "scripts",
    "public/.well-known",
    ".github/workflows",
  ])
    .split("\0")
    .filter(Boolean)
    .sort();
  const source = createHash("sha256");
  for (const file of inputs) {
    source.update(file + "\0");
    source.update(readFileSync(path.join(root, file)));
  }
  const manifest = {
    channel: "beta",
    applicationId: config.applicationId,
    versionName: config.versionName,
    versionCode: Number(config.versionCode),
    minSdk: Number(config.minSdk),
    targetSdk: Number(config.targetSdk),
    commit,
    dirty,
    androidInputsSha256: source.digest("hex"),
    file: name,
    bytes: bytes.length,
    sha256: sha256(bytes),
    certificateSha256: fingerprint,
    webOrigin: `https://${config.host}`,
    webContent: "Hosted independently; not embedded in this APK",
    domainVerification,
    deviceAcceptance: "Requires the release acceptance checklist",
    createdAt: new Date().toISOString(),
  };
  writeFileSync(path.join(out, "release-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  const notes =
    `# PaMaRa Bodega ${config.versionName}\n\n![PaMaRa AyN](https://github.com/NicoCG32/pamara-bodega/releases/download/android-v${config.versionName}/BRANDING.png)\n\nCandidata beta de evaluación para Android 8.0 o superior y navegador compatible actualizado.\n\n` +
    `- APK: ${name}\n- Fuente: ${commit}${dirty ? " + cambios locales (no publicar)" : ""}\n- Paquete: ${config.applicationId}; versionCode: ${config.versionCode}\n` +
    `- SHA-256 APK: ${manifest.sha256}\n- Certificado SHA-256: ${fingerprint}\n- Asociación del dominio: ${domainVerification}\n\n` +
    `Instalar el APK adjunto desde el teléfono, autorizando esa fuente cuando Android lo solicite. En futuras actualizaciones instalar encima, con la misma firma y un versionCode mayor; no desinstalar ni borrar datos del navegador.\n\n` +
    `La app carga https://${config.host}/ y necesita ese servidor para arrancar y usar IA, acceso Google y respaldo. El contenido web se actualiza independientemente del APK. Los datos pertenecen al origen y al perfil del navegador; otro navegador, dominio o teléfono no comparte automáticamente sus datos. Comprobar el respaldo antes de cambiar de dispositivo.\n\n` +
    `Límites de esta beta: no se acredita funcionamiento offline completo, notificaciones con la app cerrada ni todos los flujos Google/micrófono/respaldo. Si falta la asociación web, aparecerá la barra del navegador. Completar docs/android-acceptance.md antes de distribuir o anunciar estabilidad.\n`;
  writeFileSync(path.join(out, "RELEASE_NOTES.md"), notes);
  for (const file of ["LICENSE", "NOTICE", "LICENSING.md"])
    copyFileSync(path.join(root, file), path.join(out, file));
  copyFileSync(
    path.join(root, "branding/03_Banners/PaMaRa_AyN_banner_claro.png"),
    path.join(out, "BRANDING.png"),
  );
  const assets = [
    name,
    "release-manifest.json",
    "RELEASE_NOTES.md",
    "LICENSE",
    "NOTICE",
    "LICENSING.md",
    "BRANDING.png",
  ];
  writeFileSync(
    path.join(out, "SHA256SUMS.txt"),
    assets.map((file) => `${sha256(readFileSync(path.join(out, file)))}  ${file}`).join("\n") +
      "\n",
  );
  console.log(JSON.stringify({ output: out, ...manifest }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
