# GameCreator - Electron App

A standalone Electron application for the Draw Canvas Game Creator with USB token authorization.

## Features

- **Cross-platform**: Runs on Windows, macOS, and Linux
- **USB Token Authorization**: Secure app access via USB token verification
- **Drawing Canvas**: Full-featured canvas drawing game creation interface
- **Quiz System**: Multiple quiz types (flashcards, word puzzles, jigsaw, etc.)
- **Standalone**: No need for Angular/Ionic dependencies

## Project Structure

```
GameCreator/
├── electron/
│   ├── main.js           # Main Electron process
│   ├── preload.js        # Preload script for secure IPC
│   ├── usb-guard.js      # USB token verification logic
│   └── usb-auth.json     # USB configuration (auto-generated)
├── assets/               # Game assets (icons, images, audio)
├── standalone-draw-canvas-game.html  # Main app UI
├── standalone-draw-canvas-game.js    # Main app logic
├── drawing-modal.js      # Drawing modal functionality
├── attribute-modal.js    # Attribute editor
├── quiz-manager.js       # Quiz management
├── utilities.js          # Utility functions
├── prepare-install-drive.ps1  # USB drive preparation script
├── mac_signing.env       # macOS signing config (template)
└── package.json          # Project configuration
```

## Setup

### 1. Install Dependencies

```bash
npm i --force
```

### 2. Development

Run the app in development mode:

```bash
npm run electron:dev
```

### 3. Build for Production

**Windows:**

```bash
npm run electron:build:win
```

**macOS:**

```bash
npm run electron:build:mac
```

**Linux:**

```bash
npm run electron:build:linux
```

## USB Token Setup

### Prepare Installation USB Drive

1. **Run the PowerShell script** (requires Administrator privileges):

```powershell
.\prepare-install-drive.ps1 -DriveLetter E -VolumeLabel INSTALL
```

Options:

- `-DriveLetter`: USB drive letter (default: E)
- `-VolumeLabel`: Volume label for the drive (default: INSTALL)
- `-SkipFormat`: Skip formatting the drive
- `-ForceNewToken`: Generate a new token even if one exists
- `-QuickFormat`: Use quick format instead of full format

2. **The script will**:

   - Format the USB drive (optional)
   - Create installer directories structure
   - Generate a secure USB token
   - Create `usb-auth.json` in the `electron/` folder
   - Set up cross-platform launcher scripts

3. **Place your built installers**:
   - Windows: Copy `setup.exe` to `E:\Installers\windows\`
   - macOS: Copy `.dmg` files to `E:\Installers\mac\`

### USB Token Verification

The app will check for the USB token on startup:

- Windows: Scans all drive letters (C: to Z:)
- macOS: Checks `/Volumes/`, `/media/`, `/mnt/`
- Token must match the hash stored in `usb-auth.json`

**Environment Variables** (for development/testing):

- `USB_TOKEN_OVERRIDE`: Use a specific token string
- `USB_TOKEN_PATH`: Use a specific token file path

## macOS Code Signing

1. **Configure signing** (edit `mac_signing.env`):

   - Add your Developer ID
   - Add Apple ID and Team ID
   - Generate app-specific password

2. **Sign and notarize**:

```bash
npm run electron:build-sign-notarize:mac
```

## Troubleshooting

### USB Authorization Failed

- Ensure the USB drive is connected
- Verify the drive label matches the configuration
- Check that `device.token` file exists in `Installers/common/`
- Verify `electron/usb-auth.json` exists and has correct tokenHash

### Build Issues

- Run `npm install` to ensure all dependencies are installed
- Clear `dist-electron/` folder and rebuild
- Check `node_modules` exists and contains `electron` and `electron-builder`

### macOS Specific

- For first-time launch, right-click the app and select "Open"
- Ensure Gatekeeper allows the app to run
- For signing issues, verify your Developer ID certificate in Keychain Access

## License

Proprietary - All rights reserved
