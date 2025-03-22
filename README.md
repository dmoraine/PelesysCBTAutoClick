# PelesysCBTAutoClick

This script is designed to automate the navigation through a CBT course on the Pelesys website. It simulates a left-click on the "Next" button 2 seconds after the end of each slide. The 'p' key can be used to pause or resume the auto-click functionality.

## Installation Guide

### Option 1: One-Click Installation (Recommended)

1. First install either Tampermonkey (Chrome) or Greasemonkey (Firefox) if you haven't already:
   - [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Greasemonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)

2. For Chrome users only: Enable Developer Mode
   - Go to Chrome's extensions page (chrome://extensions)
   - Enable the "Developer mode" switch at the top right corner
   - Find Tampermonkey in the list and check "Allow access to file URLs"
   - Restart Chrome for the changes to take effect
   - For more details, see the [official Tampermonkey documentation](https://www.tampermonkey.net/faq.php?locale=en#Q209)

3. After installing the extension, [Click here to install the script](https://github.com/dmoraine/PelesysCBTAutoClick/raw/master/pelesyscbtautoclick.user.js)
   - A Tampermonkey/Greasemonkey window will open automatically
   - Click on "Install" or "OK" to confirm the installation

### Option 2: Manual Installation

If the one-click installation doesn't work, you can install the script manually:

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
5. Important notes:
   - If the auto-click status is not working, click once on the menu bar above the slide to activate it
   - For interactive slides (where you need to perform actions like clicking on screen elements), the script will wait for you to complete the required interaction before proceeding

## Troubleshooting

If the script is not working:
1. Make sure the script is enabled in Tampermonkey/Greasemonkey
2. Refresh your Pelesys CBT course page
3. Check if the indicator appears in the top-left corner
4. Click once on the menu bar above the slide to ensure the script can detect slide status
5. If issues persist, try disabling and re-enabling the script

## Support

If you encounter any issues or have questions, please open an issue in this repository.