#!/usr/bin/env node
/**
 * Builds and installs the iOS app on a physically connected iPhone.
 *
 * This intentionally refuses to run when no iPhone is connected, so it can
 * never fall back to an iOS Simulator build.
 *
 * Usage:
 *   yarn ios:build
 *   IOS_DEVICE="Kingdavid iPhone" yarn ios:build
 *   CONFIGURATION=Debug yarn ios:build
 *   KEEP_ENTITLEMENTS=1 yarn ios:build
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const mobileRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const iosDir = path.join(mobileRoot, "ios");

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

function run(command, args) {
  console.log(`\n$ ${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, {
    cwd: mobileRoot,
    stdio: "inherit",
  });
  if (result.error) {
    fail(result.error.message);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getPhysicalDevices() {
  let output;
  try {
    output = JSON.parse(
      execFileSync("xcrun", ["devicectl", "list", "devices", "--json-output", "-"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }),
    );
  } catch {
    fail(
      "Could not query CoreDevice for connected devices.\n" +
        "Make sure Xcode is installed and selected with `xcode-select -p`.",
    );
  }

  const devices = output.result?.devices ?? [];

  return devices.flatMap((entry) => {
    const properties = entry.properties ?? {};
    const hardware = properties.hardware ?? entry.hardwareProperties ?? {};
    const connection = properties.connection ?? entry.connectionProperties ?? {};
    const state = properties.state ?? {};
    const device = properties.device ?? entry.deviceProperties ?? {};

    // Only iPhones are valid targets; paired iPads, Watches and TVs must not
    // satisfy the guard or be selected by accident.
    if (
      hardware.reality !== "physical" ||
      hardware.deviceType !== "iPhone" ||
      connection.pairingState !== "paired" ||
      !hardware.udid
    ) {
      return [];
    }

    return [
      {
        name: state.name ?? device.name ?? entry.deviceProperties?.name ?? "iPhone",
        udid: hardware.udid,
      },
    ];
  });
}

function isDeviceConnected(udid) {
  try {
    // `devicectl list` can report a paired, wired iPhone as disconnected even
    // when CoreDevice can reach it. The detail query opens the device session,
    // so it is the reliable check for build/install readiness.
    const output = JSON.parse(
      execFileSync(
        "xcrun",
        [
          "devicectl",
          "device",
          "info",
          "details",
          "--device",
          udid,
          "--json-output",
          "-",
          "--timeout",
          "10",
        ],
        {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
          timeout: 30_000,
        },
      ),
    );
    const connection =
      output.result?.properties?.connection ??
      output.result?.connectionProperties ??
      {};
    return (
      connection.state === "connected" ||
      connection.tunnelState === "connected"
    );
  } catch {
    return false;
  }
}

let devices = getPhysicalDevices();

if (devices.length === 0) {
  fail(
    "No paired physical iPhone found.\n" +
      "Connect and unlock your iPhone with a cable (Developer Mode enabled), then run `yarn ios:build` again.\n" +
      "Nothing was built or installed on the simulator.",
  );
}

devices = devices.filter((device) => isDeviceConnected(device.udid));
if (devices.length === 0) {
  fail(
    "Your iPhone is paired but not connected.\n" +
      "Plug it in with a cable and unlock it, then run `yarn ios:build` again.\n" +
      "Nothing was built or installed on the simulator.",
  );
}

const requestedDevice = process.env.IOS_DEVICE;
let device;

if (requestedDevice) {
  device = devices.find(
    (candidate) =>
      candidate.udid === requestedDevice || candidate.name === requestedDevice,
  );
  if (!device) {
    fail(
      `IOS_DEVICE="${requestedDevice}" did not match a connected physical iPhone.\n` +
        `Connected devices:\n${devices
          .map((candidate) => `  • ${candidate.name} (${candidate.udid})`)
          .join("\n")}`,
    );
  }
} else if (devices.length === 1) {
  device = devices[0];
} else {
  fail(
    "Multiple physical iPhones are connected:\n" +
      devices
        .map((candidate) => `  • ${candidate.name} (${candidate.udid})`)
        .join("\n") +
      "\nSet IOS_DEVICE=<name-or-udid> and run again.",
  );
}

console.log(`Using physical device: ${device.name} (${device.udid})`);
console.log("Running Expo prebuild…");
run("npx", ["expo", "prebuild", "--platform", "ios"]);

if (!existsSync(iosDir)) {
  fail("The iOS project was not generated.");
}

const workspaces = readdirSync(iosDir).filter((name) =>
  name.endsWith(".xcworkspace"),
);
if (workspaces.length !== 1) {
  fail(
    `Expected exactly one Xcode workspace in ${iosDir}, found ${workspaces.length}.`,
  );
}

const workspaceName = workspaces[0].replace(/\.xcworkspace$/, "");
const workspacePath = path.join(iosDir, workspaces[0]);
const projectName =
  readdirSync(iosDir)
    .find((name) => name.endsWith(".xcodeproj"))
    ?.replace(/\.xcodeproj$/, "") ?? workspaceName;

// Personal Apple teams cannot provision Sign in with Apple. The generated
// native project is disposable (Expo prebuild), so strip that one capability
// for local device builds unless the caller opts out.
const entitlementsPath = path.join(
  iosDir,
  projectName,
  `${projectName}.entitlements`,
);
if (!process.env.KEEP_ENTITLEMENTS && existsSync(entitlementsPath)) {
  const entitlements = readFileSync(entitlementsPath, "utf8");
  if (entitlements.includes("com.apple.developer.applesignin")) {
    console.warn(
      "\n⚠ Removing the Sign in with Apple entitlement for this local build.",
    );
    console.warn(
      "  Personal Apple teams cannot provision it. Set KEEP_ENTITLEMENTS=1 to keep it.\n",
    );
    run("plutil", [
      "-remove",
      // plutil treats dots as key-path separators, so the entitlement key
      // must be escaped to remove this single top-level key.
      "com\\.apple\\.developer\\.applesignin",
      entitlementsPath,
    ]);
  }
}

const configuration =
  process.env.CONFIGURATION === "Debug" ? "Debug" : "Release";
const derivedDataPath = path.join(iosDir, ".derivedData");

run("xcrun", [
  "xcodebuild",
  "-workspace",
  workspacePath,
  "-scheme",
  workspaceName,
  "-configuration",
  configuration,
  "-destination",
  `id=${device.udid}`,
  "-derivedDataPath",
  derivedDataPath,
  "-allowProvisioningUpdates",
  "CODE_SIGN_STYLE=Automatic",
  "build",
]);

const productsDir = path.join(
  derivedDataPath,
  "Build",
  "Products",
  `${configuration}-iphoneos`,
);
const appName = existsSync(productsDir)
  ? readdirSync(productsDir).find((name) => name.endsWith(".app"))
  : undefined;
if (!appName) {
  fail(`No .app bundle was produced in ${productsDir}`);
}

const appPath = path.join(productsDir, appName);
const appConfig = JSON.parse(
  readFileSync(path.join(mobileRoot, "app.json"), "utf8"),
);
const bundleIdentifier = appConfig.expo?.ios?.bundleIdentifier;
if (!bundleIdentifier) {
  fail("Set expo.ios.bundleIdentifier in apps/mobile/app.json.");
}

run("xcrun", [
  "devicectl",
  "device",
  "install",
  "app",
  "--device",
  device.udid,
  appPath,
]);

console.log(`\nLaunching ${bundleIdentifier} on ${device.name}…`);
const launch = spawnSync(
  "xcrun",
  [
    "devicectl",
    "device",
    "process",
    "launch",
    "--device",
    device.udid,
    bundleIdentifier,
  ],
  { cwd: mobileRoot, stdio: "inherit" },
);

if (launch.status !== 0) {
  console.warn("\nThe app was installed but iOS blocked the launch.");
  console.warn(
    "On the iPhone, open Settings → General → VPN & Device Management → Developer App,",
  );
  console.warn("trust the developer profile, then open the app.");
}
