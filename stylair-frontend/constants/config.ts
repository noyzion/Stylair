// API Configuration - use local IP for physical devices, localhost for emulator
export const API_BASE_URL = "http://192.168.1.186:5292";

export const API_ENDPOINTS = {
  OUTFIT_CHAT_SUGGEST: `${API_BASE_URL}/api/outfit-chat/suggest`,
  SAVE_OUTFIT: `${API_BASE_URL}/api/saved-outfits`,
};

