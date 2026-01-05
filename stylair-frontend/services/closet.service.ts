import { AddClosetItemRequest, OutfitItem, SavedOutfit } from '../types/closet';
import { API_BASE_URL } from '../constants/config';
import { getJwtToken } from './auth/auth.service';

// add item to closet
export async function addItemToCloset(item: AddClosetItemRequest): Promise<{ message: string; item?: any }> {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}/api/closet/item`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 👈 הוספת JWT token
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to add item' }));
    throw new Error(errorData.message || 'Failed to add item');
  }

  return response.json();
}

// get all items from closet
export async function getAllItemsFromCloset(): Promise<OutfitItem[]> {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}/api/closet/items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 👈 הוספת JWT token
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get items');
  }

  return response.json();
}

// save outfit to archive
export async function saveOutfit(outfit: {
  occasionLabel: string;
  items: OutfitItem[];
  reasonText: string;
}): Promise<{ message: string; outfit?: any }> {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const response = await fetch(API_BASE_URL + '/api/saved-outfits', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 👈 הוספת JWT token
    },
    body: JSON.stringify(outfit),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to save outfit' }));
    throw new Error(errorData.message || 'Failed to save outfit');
  }

  return response.json();
}

// get all saved outfits from archive
export async function getAllSavedOutfits(): Promise<SavedOutfit[]> {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}/api/saved-outfits`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 👈 הוספת JWT token
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get saved outfits');
  }

  return response.json();
}

// delete item from closet
export async function deleteItemFromCloset(itemImage: string): Promise<{ message: string }> {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const encodedItemImage = encodeURIComponent(itemImage);
  const response = await fetch(`${API_BASE_URL}/api/closet/item/${encodedItemImage}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 👈 הוספת JWT token
    },
  });

  if (!response.ok) {
    let errorMessage = 'Failed to delete item';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Try to parse JSON response, but don't fail if it's empty or invalid
  try {
    const text = await response.text();
    if (text) {
      return JSON.parse(text);
    }
    // If response is empty, return success message
    return { message: 'Item deleted successfully' };
  } catch {
    // If JSON parsing fails, but status is OK, assume success
    return { message: 'Item deleted successfully' };
  }
}

// delete outfit from archive
export async function deleteOutfitFromArchive(outfitId: string): Promise<{ message: string }> {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}/api/saved-outfits/${outfitId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 👈 הוספת JWT token
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete outfit' }));
    throw new Error(errorData.message || 'Failed to delete outfit');
  }

  return response.json();
}

// Analyze image with AI
export interface AIImageAnalysisRequest {
  imageUrl?: string;
  imageBase64?: string;
}

export interface AIImageAnalysisResponse {
  category: string;
  colors: string[];
  styles: string[];
  seasons: string[];
  confidence: number;
  notes?: string;
  success: boolean;
  errorMessage?: string;
}

export async function analyzeImageWithAI(
  imageBase64: string
): Promise<AIImageAnalysisResponse> {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}/api/ai/analyze-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      imageBase64: imageBase64,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to analyze image' }));
    throw new Error(errorData.message || 'Failed to analyze image');
  }

  return response.json();
}

// update item in closet
export async function updateItemInCloset(
  itemImage: string,
  item: AddClosetItemRequest
): Promise<{ message: string; item?: any }> {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const encodedItemImage = encodeURIComponent(itemImage);
  const response = await fetch(`${API_BASE_URL}/api/closet/item/${encodedItemImage}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update item' }));
    throw new Error(errorData.message || 'Failed to update item');
  }

  return response.json();
}

// Outfit Chat with AI
export interface OutfitChatRequest {
  userMessage: string;
  weather?: {
    temperature?: number;
    condition?: string;
    isNight?: boolean;
  };
}

export interface OutfitItemSuggestion {
  id: string;
  category: string;
  reason: string;
}

export interface OutfitSuggestion {
  event: string;
  items: OutfitItemSuggestion[];
  missingItems: string[];
  notes: string;
}

export interface OutfitChatResponse {
  success: boolean;
  outfits: OutfitSuggestion[];
  errorMessage?: string;
}

export async function suggestOutfitWithAI(
  request: OutfitChatRequest
): Promise<OutfitChatResponse> {
  const token = await getJwtToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}/api/outfit-chat/suggest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to generate outfit suggestions';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}