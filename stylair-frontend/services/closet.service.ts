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
    const errorData = await response.json().catch(() => ({ message: 'Failed to delete item' }));
    throw new Error(errorData.message || 'Failed to delete item');
  }

  return response.json();
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
