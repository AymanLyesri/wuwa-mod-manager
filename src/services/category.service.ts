import { Category } from '../interfaces/Category.interface';
import categoriesData from '../assets/categories.json';
import { toast } from "react-toastify";

export const getCategories = (): Category[] => {
    if (!Array.isArray(categoriesData.categories)) {
        toast.error("Error loading categories");
        return [];
    }

    return categoriesData.categories;
}; 