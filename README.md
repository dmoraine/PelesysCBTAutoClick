# PelesysCBTAutoClick

This script is designed to automate the navigation through a CBT course on the Pelesys website. It simulates a left-click on the "Next" button 2 seconds after the end of each slide. The 'p' key can be used to pause or resume the auto-click functionality.

## Installation Guide

### Step 1: Install the Browser Extension

First, you need to install either Tampermonkey or Greasemonkey extension in your browser:

#### For Chrome users:
1. Open the Chrome Web Store
2. Search for "Tampermonkey" or [click here](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
3. Click on "Add to Chrome"
4. Click "Add extension" in the popup

#### For Firefox users:
1. Open Firefox Add-ons page
2. Search for "Greasemonkey" or [click here](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
3. Click on "Add to Firefox"
4. Click "Add" in the popup

### Step 2: Install the Script

1. Click on the Tampermonkey/Greasemonkey icon in your browser toolbar (it looks like a black square with two circles)
2. Select "Create a new script" or "New script"
3. Delete any existing code in the editor
4. Copy the entire content of the `pelesyscbtautoclick.user.js` file
5. Paste it into the editor
6. Press Ctrl+S (or Cmd+S on Mac) to save the script
7. Click on "File" → "Save" in the editor menu

### Step 3: Verify Installation

1. Go to the Tampermonkey/Greasemonkey dashboard
2. You should see "Pelesys CBT - Auto Click" listed in your scripts
3. Make sure the script is enabled (there should be a checkmark or toggle switch next to it)

## Usage Instructions

1. Navigate to your Pelesys CBT course
2. You will see an indicator in the top-left corner showing "Auto Click (p): ON"
3. The script will automatically click the "Next" button 2 seconds after each slide ends
4. To pause/resume the auto-click functionality:
   - Press the 'p' key on your keyboard
   - The indicator will show "Auto Click (p): OFF" when paused

## Troubleshooting

If the script is not working:
1. Make sure the script is enabled in Tampermonkey/Greasemonkey
2. Refresh your Pelesys CBT course page
3. Check if the indicator appears in the top-left corner
4. If issues persist, try disabling and re-enabling the script

## Support

If you encounter any issues or have questions, please open an issue in this repository.