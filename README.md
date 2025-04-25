# PelesysCBTAutoClick - Auto Click & Text Saver

This script is designed to automate the navigation through a CBT course on the Pelesys website. It performs two main functions:
1.  **Auto Click:** Simulates a left-click on the "Next" button 2 seconds after the end of each slide. The 'p' key can be used to pause or resume this functionality.
2.  **Text Saver:** Captures the audio text displayed on each slide and saves it to your browser's `localStorage`. A new entry is created for each session (based on date and time). Pressing the 't' key opens an interface to view, copy, or delete these saved text sessions.

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
2. You should see "Pelesys CBT - Auto Click & Text Saver" listed in your scripts
3. Make sure the script is enabled (there should be a checkmark or toggle switch next to it)

## Usage Instructions

1. Navigate to your Pelesys CBT course.
2. You will see an indicator in the top-left corner showing "Auto Click (p): ON".
3. **Auto Clicking:**
   - The script will automatically click the "Next" button 2 seconds after each slide ends.
   - To pause/resume the auto-click functionality, press the 'p' key. The indicator will update accordingly ("ON" or "OFF").
4. **Text Saving & Management:**
   - As you progress through the slides with auto-click enabled, the script automatically saves the audio text associated with each slide to your browser's `localStorage`.
   - A new storage entry (session) is created each time you start a new browsing session on the course page.
   - To manage the saved texts, press the 't' key. This will open a management panel.
   - Inside the panel:
     - Use the dropdown menu to select a saved session (sorted by date/time, newest first).
     - The text area below will display the content of the selected session.
     - Click "Copier le Texte" to copy the displayed text to your clipboard.
     - Click "Supprimer Session" to delete the currently selected session from `localStorage` (confirmation required).
     - Click "Fermer" or press the 't' key again to close the panel.
5. **Important notes:**
   - If the auto-click status indicator doesn't appear or seems inactive, click once anywhere on the main content area (like the menu bar above the slide) to ensure the page has focus.
   - For interactive slides (requiring clicks or other actions), the script waits for you to complete the interaction before the auto-click timer starts.
   - Saved texts are stored locally in your browser and are not sent anywhere.

## Troubleshooting

If the script is not working:
1. Make sure the script is enabled in Tampermonkey/Greasemonkey
2. Refresh your Pelesys CBT course page
3. Check if the indicator appears in the top-left corner
4. Click once on the menu bar above the slide to ensure the script can detect slide status
5. If issues persist, try disabling and re-enabling the script

## Support

If you encounter any issues or have questions, please open an issue in this repository.