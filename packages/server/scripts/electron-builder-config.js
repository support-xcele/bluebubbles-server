// NOTE: All paths are relative to the package.json that will be loading this configuration file.
// Making them relative to the scripts folder will break the commands
module.exports = {
    "productName": "Xcelerate Management",
    "appId": "com.xcelerate.management",
    "npmRebuild": true,
    "directories": {
        "output": "releases",
        "buildResources": "appResources"
    },
    "asar": true,
    "asarUnpack": [
        "node_modules/better-sqlite3/**/*",
        "node_modules/node-mac-contacts/**/*",
        "node_modules/node-mac-permissions/**/*",
        "node_modules/find-process/**/*",
        "node_modules/ngrok/**/*",
        "**/*.node"
    ],
    "extraResources": [
        "appResources"
    ],
    "mac": {
        "category": "public.app-category.business",
        "target": [
            {
                "target": "dmg",
                "arch": [
                    "arm64"
                ],
            },
            {
                "target": "dir",
                "arch": [
                    "arm64"
                ],
            }
        ],
        "type": "distribution",
        "icon": "./icon.icns",
        "identity": null,
        "darkModeSupport": true,
        "hardenedRuntime": true,
        "notarize": false,
        "entitlements": "./scripts/entitlements.mac.plist",
        "entitlementsInherit": "./scripts/entitlements.mac.plist",
        "extendInfo": {
            "NSContactsUsageDescription": "Xcelerate Management needs access to your Contacts",
            "NSAppleEventsUsageDescription": "Xcelerate Management needs access to run AppleScripts",
            "NSSystemAdministrationUsageDescription": "Xcelerate Management needs access to manage your system",
        },
        "gatekeeperAssess": false,
        "minimumSystemVersion": "10.11.0",
        "signIgnore": [
            "ngrok$",
            "zrok$",
            "cloudflared$"
        ],
    },
    "dmg": {
        "sign": false,
        "writeUpdateInfo": false
    },
};
