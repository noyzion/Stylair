import { Category, Style, Season } from '../app/(tabs)/addItemScreen'; 

export type AddClosetItemRequest = { //making new type, we can use it in other files
  itemName: string;
  itemCategory: Category;
  itemImage: string;
  style: Style[];
  colors: string[];
  season: Season[];
  size?: string;
  tags?: string[];
};

export interface OutfitItem {
  itemId: string;
  itemName: string;
  itemCategory: string;
  itemImage: string;
  style: string[];
  colors: string[];
  season: string[];
  size?: string;
  tags?: string[];
}

export interface SavedOutfit {
  outfitId: string;
  occasionLabel: string;
  reasonText: string;
  items: OutfitItem[];
  createdAt: string;
}
