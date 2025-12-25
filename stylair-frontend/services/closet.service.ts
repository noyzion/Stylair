import { AddClosetItemRequest } from '../types/closet';

const BASE_URL = 'http://192.168.1.186:5292';

export async function addItemToCloset(
  item: AddClosetItemRequest
): Promise<{ message: string }> {
  const response = await fetch(`${BASE_URL}/api/closet/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to add item');
  }

  return response.json();
}
