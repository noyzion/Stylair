import { AddClosetItemRequest, OutfitItem } from '../types/closet';
import { API_BASE_URL } from '../constants/config';

export async function addItemToCloset(item: AddClosetItemRequest): Promise<{ message: string; item?: any }> {
  const response = await fetch(`${API_BASE_URL}/api/closet/item`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to add item' }));
    throw new Error(errorData.message || 'Failed to add item');
  }

  return response.json();
}

export async function getAllItemsFromCloset(): Promise<OutfitItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/closet/items`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get items');
  }

  return response.json();
}
