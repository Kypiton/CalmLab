export type CategoryType = 'all' | 'recovery' | 'relax' | 'sleep' | 'focus';

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