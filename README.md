# Simply Dark Chrome Extension

**Simply Dark** is a lightweight Chrome extension that allows you to toggle a dark mode overlay for any webpage, including PDFs. Designed for ease of use, this extension uses a minimalistic overlay and intuitive controls, making it perfect for users who spend long hours browsing or reading online.

---

## Features

- **Dark Mode Overlay**: Applies a dark mode effect to any webpage or PDF using a high-contrast overlay.
- **PDF Support**: Automatically detects PDF files and applies the dark mode overlay.
- **Icon Toggle**: Quickly activate or deactivate dark mode by clicking the extension's toolbar icon.
- **Lightweight and Fast**: Minimal performance impact with efficient JavaScript execution.

---

## How It Works

- For **standard web pages**, the extension injects a semi-transparent overlay using `mix-blend-mode: difference`, transforming light colors into darker shades.
- For **PDFs**, the extension utilizes Chrome's scripting API to dynamically inject the dark mode script for seamless compatibility.

---

## Installation

1. Download or clone the extension files.
2. Build the extension with `npm run build`
3. Go to `chrome://extensions/` in your browser.
4. Enable **Developer Mode** (toggle in the top-right corner).
5. Click **Load unpacked** and select the `/dist` folder.
6. The extension will appear in your toolbar as **Simply Dark**.

---

## Usage

### Toggle Dark Mode
- **Keyboard Shortcut**: Press `Ctrl+Alt+D` (Windows/Linux) or `Option+Shift+D` (macOS) to toggle dark mode on/off.
- **Toolbar Icon**: Click the extension icon to activate or deactivate dark mode.

### For PDFs
Dark mode is automatically applied to PDF documents. If the overlay does not appear, ensure the extension is enabled for local file access.

---

## Permissions

The extension requests the following permissions:
- **activeTab**: To access the current webpage or PDF.
- **scripting**: To inject JavaScript for toggling the overlay.
- **host_permissions**: To enable functionality for local files (`file:///*`).

---

## Known Issues

- **PDF Viewer Customizations**: May not work with all third-party PDF viewers.
- **Dynamic Web Pages**: Some highly interactive pages may not fully adapt to the overlay.

---

## Contributing

Feel free to contribute to the extension by submitting issues or pull requests in the GitHub repository. For suggestions or enhancements, contact us directly.

---

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute the extension with proper attribution.

---

Enjoy browsing in dark mode with **Simply Dark**! 😊

---

## To Do
* Create website with screenshot
* Publish to chrome web store
* Create icon with on/off modes