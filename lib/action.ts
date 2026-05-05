'use server';

import { CategoryType } from '@/app/generated/prisma/enums';
import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export default async function action(formData: FormData) {
	const product_name = formData.get('product_name');
	const brand = formData.get('brand');
	const price = formData.get('price');
	const category = formData.get('category');
	const description = formData.get('description');
	const image_url = formData.get('image_url');

	if (typeof product_name !== 'string' || product_name.trim() === '') {
		throw new Error('Product name is required');
	}

	if (typeof brand !== 'string' || brand.trim() === '') {
		throw new Error('Brand is required');
	}

	if (typeof price !== 'string' || price.trim() === '') {
		throw new Error('Price is required');
	}

	if (typeof category !== 'string' || category.trim() === '') {
		throw new Error('Category is required');
	}

	if (typeof description !== 'string' || description.trim() === '') {
		throw new Error('Description is required');
	}

	if (typeof image_url !== 'string' || image_url.trim() === '') {
		throw new Error('Image URL is required');
	}

	const priceNumber = Number(price);

	if (isNaN(priceNumber) || priceNumber < 0) {
		throw new Error('Price must be greater than 0');
	}

	const allowedCategories = Object.values(CategoryType);

	if (!allowedCategories.includes(category as CategoryType)) {
		throw new Error('Categories are not suitable');
	}

	await prisma.product.create({
		data: {
			title: product_name,
			brand,
			price: priceNumber,
			category: category as CategoryType,
			description,
			image: image_url
		},
	});

	revalidatePath('/admin/products');
	redirect('/admin/products');
}

export async function deleteProduct(productId: number) {
	await prisma.product.delete({
		where: {
			id: productId,
		},
	});

	revalidatePath('/admin/products');
}

export async function updateProduct(productId: number, formData: FormData) {
	const product_name = formData.get('product_name');
	const brand = formData.get('brand');
	const price = formData.get('price');
	const category = formData.get('category');
	const description = formData.get('description');
	const image_url = formData.get('image_url');

	if (typeof product_name !== 'string' || product_name.trim() === '') {
		throw new Error('Product name is required');
	}

	if (typeof brand !== 'string' || brand.trim() === '') {
		throw new Error('Brand is required');
	}

	if (typeof price !== 'string' || price.trim() === '') {
		throw new Error('Price is required');
	}

	if (typeof category !== 'string' || category.trim() === '') {
		throw new Error('Category is required');
	}

	if (typeof description !== 'string' || description.trim() === '') {
		throw new Error('Description is required');
	}

	if (typeof image_url !== 'string' || image_url.trim() === '') {
		throw new Error('Image URL is required');
	}

	const priceNumber = Number(price);

	if (isNaN(priceNumber) || priceNumber < 0) {
		throw new Error('Price must be greater than 0');
	}

	const allowedCategories = Object.values(CategoryType);

	if (!allowedCategories.includes(category as CategoryType)) {
		throw new Error('Categories are not suitable');
	}

	await prisma.product.update({
		where: {
			id: productId,
		},
		data: {
			title: product_name,
			brand,
			price: priceNumber,
			category: category as CategoryType,
			description,
			image: image_url,
		},
	});

	revalidatePath('/admin/products');
	redirect('/admin/products');
}