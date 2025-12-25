import { Category, Style, Season } from '../app/(tabs)/addItemScreen'; 

export type AddClosetItemRequest = {
  itemName: string;
  itemCategory: Category;
  itemImage: string;
  style: Style[];
  colors: string[];
  season: Season[];
};
