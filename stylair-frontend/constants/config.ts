// API Configuration
// Change this to your local machine's IP address (not localhost!)
// To find your IP:
//   - Windows: Run `ipconfig` in PowerShell/CMD and look for "IPv4 Address"
//   - Mac: Run `ipconfig getifaddr en0` (or check network settings)
//   - Linux: Run `hostname -I` or `ip addr show`
// Make sure your backend runs on 0.0.0.0:5292 (not localhost)
// Current IPs found: 10.20.0.34, 172.25.144.1
export const API_BASE_URL = "http://10.0.0.19:5292"; // Replace with your local IP (e.g., "http://192.168.1.100:5292")

// For localhost (only works in browser/emulator, not on physical device):
// export const API_BASE_URL = "http://localhost:5292";

export const API_ENDPOINTS = {
  OUTFIT_RECOMMENDATION: `${API_BASE_URL}/api/outfit/recommendation`,
  SAVE_OUTFIT: `${API_BASE_URL}/api/saved-outfits`,
};

