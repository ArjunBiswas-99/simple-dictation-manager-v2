# Simple Dictation Manager v2

A professional web-based speech-to-text application with multi-language support and MS Word-like interface. Built with vanilla JavaScript following SOLID principles.

## 🌐 Live Demo

**Try it now:** [https://arjunbiswas-99.github.io/simple-dictation-manager-v2/](https://arjunbiswas-99.github.io/simple-dictation-manager-v2/)

No installation needed - just open the link and start dictating!

## Features

✅ **Real-time Speech Recognition** - Live transcription as you speak  
✅ **Multi-language Support** - English, Hindi, Bengali, German, Spanish  
✅ **Manual Language Switching** - Easy dropdown to switch between languages  
✅ **Voice Commands** - Punctuation, navigation, and editing commands  
✅ **Rich Text Formatting** - Bold, italic, underline  
✅ **Auto-capitalization** - Smart sentence capitalization  
✅ **Word & Character Count** - Live statistics  
✅ **Keyboard Shortcuts** - Quick formatting with keyboard  
✅ **Zero Installation** - Runs in browser with no dependencies  

## Requirements

- **Browser**: Chrome, Edge, or Safari (with Web Speech API support)
- **Internet**: Required for speech recognition API
- **Microphone**: Working microphone with permissions granted
- **Python 3**: For running local server

## Quick Start

### Option 1: Use GitHub Pages (Recommended)

Simply open the live link in Chrome or Edge:

**[https://arjunbiswas-99.github.io/simple-dictation-manager-v2/](https://arjunbiswas-99.github.io/simple-dictation-manager-v2/)**

- No installation required
- Works immediately
- HTTPS enabled (microphone access works)

### Option 2: Run Locally

### 1. Navigate to Project Directory

```bash
cd /Users/I557153/PersonalProjects/simple-dictation-manager-v2
```

### 2. Start Local Server

```bash
python3 -m http.server 8000
```

### 3. Open in Browser

Open Chrome or Edge and navigate to:
```
http://localhost:8000
```

### 4. Grant Microphone Permission

When prompted, click "Allow" to grant microphone access.

### 5. Start Dictating

1. Select your language from the dropdown
2. Click "Start Dictation" button
3. Start speaking!

## Usage

### Language Switching

1. Click the **Language dropdown**
2. Select your desired language
3. If currently dictating, recognition will restart with new language

### Voice Commands

#### Punctuation
- Say **"comma"** → inserts `,`
- Say **"period"** or **"full stop"** → inserts `.`
- Say **"question mark"** → inserts `?`
- Say **"exclamation mark"** → inserts `!`
- Say **"colon"** → inserts `:`
- Say **"semicolon"** → inserts `;`

#### Navigation
- Say **"new line"** or **"enter"** → inserts line break
- Say **"new paragraph"** → inserts paragraph break

#### Editing
- Say **"delete that"** → removes last sentence
- Say **"undo"** → undo last action
- Say **"redo"** → redo last action

### Text Formatting

**Using Toolbar:**
- Click **B** button for bold
- Click **I** button for italic
- Click **U** button for underline

**Using Keyboard:**
- `Ctrl+B` (or `Cmd+B` on Mac) - Bold
- `Ctrl+I` (or `Cmd+I` on Mac) - Italic
- `Ctrl+U` (or `Cmd+U` on Mac) - Underline

### Other Actions

- **Copy Text**: Click "Copy" button or use `Ctrl+Shift+C`
- **Clear All**: Click "Clear" button or use `Ctrl+Shift+X`

## Supported Languages

| Language | Code | Native Name |
|----------|------|-------------|
| English (US) | en-US | English |
| Hindi | hi-IN | हिन्दी |
| Bengali | bn-IN | বাংলা |
| German | de-DE | Deutsch |
| Spanish | es-ES | Español |

## Project Structure

```
simple-dictation-manager-v2/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Global styles
│   ├── toolbar.css        # Toolbar styles
│   └── editor.css         # Editor styles
├── js/
│   ├── app.js             # Main application orchestrator
│   ├── speechRecognition.js  # Speech recognition module
│   ├── textEditor.js      # Text editor module
│   ├── languageManager.js # Language management
│   ├── commandProcessor.js # Voice command processing
│   └── uiController.js    # UI management
└── README.md              # This file
```

## Architecture

The application follows **SOLID principles** and **modular design**:

- **SpeechRecognition** - Handles Web Speech API
- **TextEditor** - Manages text content and formatting
- **LanguageManager** - Handles language state
- **CommandProcessor** - Processes voice commands
- **UIController** - Manages UI updates
- **DictationApp** - Coordinates all modules

Each module has a single responsibility and is independently testable.

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best experience |
| Edge | ✅ Full | Chromium-based |
| Safari | ⚠️ Limited | Some features may not work |
| Firefox | ❌ No | Web Speech API not supported |

## Troubleshooting

### Microphone Not Working

1. Check browser permissions (click lock icon in address bar)
2. Ensure microphone is connected
3. Try refreshing the page
4. Use `http://localhost` instead of `file://`

### Speech Not Recognized

1. Speak clearly and at normal pace
2. Check internet connection (required for API)
3. Ensure correct language is selected
4. Reduce background noise

### Commands Not Working

1. Speak commands clearly and pause briefly
2. Commands are case-insensitive
3. Refer to voice commands list above

### Browser Shows "Not Secure" Warning

This is normal for localhost. Click "Advanced" → "Proceed to localhost".

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` / `Cmd+B` | Bold |
| `Ctrl+I` / `Cmd+I` | Italic |
| `Ctrl+U` / `Cmd+U` | Underline |
| `Ctrl+Shift+C` | Copy to clipboard |
| `Ctrl+Shift+X` | Clear editor |

## Important Notes

⚠️ **Data Persistence**: Text is NOT saved automatically. Copy your text before closing the browser.

⚠️ **Internet Required**: Speech recognition requires active internet connection.

⚠️ **Privacy**: Speech is processed by browser's Web Speech API (Google's service).

## Customization

### Adding Custom Voice Commands

Edit `js/commandProcessor.js` and add to the `commands` object:

```javascript
punctuation: {
    'your command': 'output',
}
```

### Adding More Languages

Edit `js/languageManager.js` and add to the `languages` object:

```javascript
'fr-FR': {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr'
}
```

Then update the dropdown in `index.html`.

## License

Open source - Free to use and modify.

## Support

For issues or questions, check:
- Browser console for error messages
- Microphone permissions in browser settings
- Internet connection status

---

**Built with ❤️ using Web Speech API and vanilla JavaScript**
# simple-dictation-manager-v2
