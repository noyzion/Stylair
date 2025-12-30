// API Configuration
// Change this to your local machine's IP address (not localhost!)
// To find your IP: On Mac run: ipconfig getifaddr en0 (or check network settings)
// Make sure your backend runs on 0.0.0.0:5292 (not localhost)
export const API_BASE_URL = "http://192.168.1.183:5292"; // Replace with your local IP (e.g., "http://192.168.1.100:5292")

// For localhost (only works in browser/emulator, not on physical device):
// export const API_BASE_URL = "http://localhost:5292";

export const API_ENDPOINTS = {
  OUTFIT_RECOMMENDATION: `${API_BASE_URL}/api/outfit/recommendation`,
};

