import { Category, Style, Season } from '../app/(tabs)/addItemScreen'; 

export type AddClosetItemRequest = { //making new type, we can use it in other files
  itemName: string;
  itemCategory: Category;
  itemImage: string;
  style: Style[];
  colors: string[];
  season: Season[];
};
