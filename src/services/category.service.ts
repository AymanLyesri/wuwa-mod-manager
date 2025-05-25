import { Category } from '../interfaces/Category.interface';
import categoriesData from '../assets/categories.json';

export const getCategories = (): Category[] => {
    return categoriesData.categories;
}; 