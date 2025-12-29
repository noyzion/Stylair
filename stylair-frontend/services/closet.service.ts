import { AddClosetItemRequest } from '../types/closet';
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
