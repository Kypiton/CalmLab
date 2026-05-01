export type CategoryType = 'recovery' | 'relax' | 'sleep' | 'focus';
export type CategoryFilter = 'all' | CategoryType;

export interface ProductItem {
	id: number;
	title: string;
	description: string;
	image: string;
	price: number;
	brand: string;
	rating: number;
	category: CategoryType;
}