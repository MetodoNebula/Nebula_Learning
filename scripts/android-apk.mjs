import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const localJdks = existsSync('.tools/jdk') ? readdirSync('.tools/jdk') : [];
const localJdk = localJdks.find((name) => name.startsWith('jdk-21'));
const javaHome = localJdk
  ? resolve('.tools/jdk', localJdk)
  : process.env.JAVA_HOME;
const sdkRoot = existsSync('.tools/android-sdk/platforms/android-36')
  ? resolve('.tools/android-sdk')
  : process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
if (
  !javaHome ||
  !existsSync(javaHome) ||
  !sdkRoot ||
  !existsSync(join(sdkRoot, 'platforms/android-36'))
) {
  console.error(
    'Faltan JDK 21 y/o Android SDK 36. Consulta ANDROID.md para preparar este equipo.',
  );
  process.exit(1);
}
const built = spawnSync(process.execPath, ['scripts/build-mobile.mjs'], {
  stdio: 'inherit',
});
if (built.status !== 0) process.exit(built.status ?? 1);
const windows = process.platform === 'win32';
const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: sdkRoot,
  ANDROID_SDK_ROOT: sdkRoot,
  ...(windows && !process.env.JAVA_TOOL_OPTIONS
    ? {
        JAVA_TOOL_OPTIONS:
          '-Djavax.net.ssl.trustStoreType=Windows-ROOT -Djavax.net.ssl.trustStore=NONE',
      }
    : {}),
};
const compiled = windows
  ? spawnSync(
      'cmd.exe',
      ['/d', '/c', 'gradlew.bat --no-daemon :app:assembleDebug'],
      { cwd: 'android', env, stdio: 'inherit' },
    )
  : spawnSync('./gradlew', ['--no-daemon', ':app:assembleDebug'], {
      cwd: 'android',
      env,
      stdio: 'inherit',
    });
if (compiled.status !== 0) process.exit(compiled.status ?? 1);
mkdirSync('releases', { recursive: true });
copyFileSync(
  'android/app/build/outputs/apk/debug/app-debug.apk',
  'releases/nebula-tech-debug.apk',
);
console.log(
  'APK de prueba creado: ' + resolve('releases/nebula-tech-debug.apk'),
);
