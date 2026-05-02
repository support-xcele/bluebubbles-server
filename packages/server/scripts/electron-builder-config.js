// NOTE: All paths are relative to the package.json that will be loading this configuration file.
// Making them relative to the scripts folder will break the commands
module.exports = {
    "productName": "xMessage",
    "appId": "com.BlueBubbles.BlueBubbles-Server",
    "npmRebuild": true,
    "directories": {
        "output": "releases",
        "buildResources": "appResources"
    },
    "asar": true,
    // Native (.node) bindings can't be loaded from inside an asar archive — the
    // dynamic linker needs a real filesystem path. Keep them on disk under
    // app.asar.unpacked/ so dlopen() can find them at runtime.
    "asarUnpack": [
        "**/*.node"
    ],
    "extraResources": [
        "appResources"
    ],
    "mac": {
        "category": "public.app-category.social-networking",
        "publish": [
            {
                "provider": "github",
                "repo": "bluebubbles-server",
                "owner": "BlueBubblesApp",
                "private": false,
                "channel": "latest",
                "releaseType": "draft",
                "vPrefixedTagName": true
            }
        ],
        "target": [
            {
                "target": "dmg",
                "arch": [
                    "arm64"
                ],
            }
        ],
        "type": "distribution",
        "icon": "../../icons/macos/dock-icon.png",
        "darkModeSupport": true,
        "hardenedRuntime": true,
        "notarize": false,
        "entitlements": "./scripts/entitlements.mac.plist",
        "entitlementsInherit": "./scripts/entitlements.mac.plist",
        "extendInfo": {
            "NSContactsUsageDescription": "xMessage needs access to your Contacts",
            "NSAppleEventsUsageDescription": "xMessage needs access to run AppleScripts",
            "NSSystemAdministrationUsageDescription": "xMessage needs access to manage your system",
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
    // "afterSign": "./scripts/notarize.js"
};
