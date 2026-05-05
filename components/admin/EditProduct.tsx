'use client';

import { Product } from '@/app/generated/prisma/client';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Image as ImageLucide } from 'lucide-react';

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '../ui/input';
import { ButtonGroup } from '../ui/button-group';
import { UploadDropzone } from '@/lib/uploadthing';
import Image from 'next/image';
import { updateProduct } from '@/lib/action';

interface Props {
  className?: string;
  product: Product;
}

export const EditProduct: React.FC<Props> = ({ className, product }) => {
  const [imageUrl, setImageUrl] = React.useState(product.image);

  const updateProductWithId = updateProduct.bind(null, product.id);

  React.useEffect(() => {
    console.log(imageUrl);
  }, [imageUrl]);

  return (
    <div className={className}>
      <div className='flex items-center gap-3 text-gray-500'>
        <p>Products</p>
        <p>&gt;</p>
        <p>Edit product</p>
      </div>
      <div className='flex justify-between items-center mt-2'>
        <div>
          <h2 className='font-bold text-3xl'>Edit product</h2>
          <p>Update product details for this product.</p>
        </div>
        <Link href='/admin/products' className=''>
          <Button className='py-5 px-8 rounded-lg bg-violet-600'>
            <ArrowLeft />
            <p>Back to products</p>
          </Button>
        </Link>
      </div>
      <div className='flex justify-center items-start gap-4'>
        <form action={updateProductWithId} className='bg-white p-4 rounded-lg mt-4 w-[60%]'>
          <div className='flex items-center justify-between gap-4'>
            <Field>
              <FieldLabel htmlFor='input-field-product_name'>
                Product name<span className='text-red-600 -ml-1.5'>*</span>
              </FieldLabel>
              <Input
                id='input-field-product_name'
                type='text'
                defaultValue={product.title}
                name='product_name'
                placeholder='Enter product name'
                className='rounded-md border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:border-violet-600 caret-violet-600'
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='input-field-brand_name'>
                Brand<span className='text-red-600 -ml-1.5'>*</span>
              </FieldLabel>
              <Input
                id='input-field-brand_name'
                type='text'
                defaultValue={product.brand}
                name='brand'
                placeholder='Enter brand name'
                className='rounded-md border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:border-violet-600 caret-violet-600'
              />
            </Field>
          </div>
          <div className='flex items-center justify-between gap-4 mt-4'>
            <Field>
              <FieldLabel htmlFor='input-field-price'>
                Price<span className='text-red-600 -ml-1.5'>*</span>
              </FieldLabel>
              <ButtonGroup className='flex items-center border border-violet-600 rounded-md focus-within:ring-1 focus-within:ring-violet-600'>
                <p className='py-0.75 px-2.5 border-r border-violet-600'>$</p>
                <Input
                  id='input-field-price'
                  name='price'
                  defaultValue={product.price}
                  placeholder='0.00'
                  className='border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0'
                />
              </ButtonGroup>
            </Field>
            <Field>
              <FieldLabel htmlFor='input-field-category'>
                Category<span className='text-red-600 -ml-1.5'>*</span>
              </FieldLabel>
              <Select name='category' defaultValue={product.category}>
                <SelectTrigger
                  id='input-field-category'
                  className='w-full rounded-md border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:border-violet-600 caret-violet-600'
                >
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value='recovery'>Recovery</SelectItem>
                    <SelectItem value='relax'>Relax</SelectItem>
                    <SelectItem value='sleep'>Sleep</SelectItem>
                    <SelectItem value='focus'>Focus</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className='mt-4'>
            <Field>
              <FieldLabel htmlFor='input-field-description'>
                Description<span className='text-red-600 -ml-1.5'>*</span>
              </FieldLabel>
              <Textarea
                name='description'
                id='input-field-description'
                defaultValue={product.description}
                placeholder='Enter product description...'
                className='h-25 rounded-md border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:border-violet-600 caret-violet-600'
              />
            </Field>
          </div>
          <div className='mt-4'>
            <Field>
              <FieldLabel htmlFor='input-field-image_url'>
                Product image<span className='text-red-600 -ml-1.5'>*</span>
              </FieldLabel>
              <UploadDropzone
                endpoint='imageUploader'
                appearance={{
                  button: ({ ready, isUploading }) =>
                    [
                      '!bg-violet-600',
                      'hover:!bg-violet-700',
                      '!text-white',
                      '!rounded-lg',
                      isUploading ? '!bg-violet-600 !text-white' : '',
                      ready ? '!bg-violet-600' : '',
                    ].join(' '),
                  uploadIcon: '!text-violet-600',
                  label: '!text-violet-600',
                  allowedContent: '!text-violet-600',
                }}
                onClientUploadComplete={res => {
                  const uploadedUrl = res[0].ufsUrl;
                  setImageUrl(uploadedUrl);
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
              />
              <input type='hidden' name='image_url' value={imageUrl} />
              <FieldDescription>PNG, JPG, WEBP up to 4MB</FieldDescription>
            </Field>
          </div>
          <div className='flex justify-end items-center gap-2 mt-4'>
            <Button variant='outline' className='py-4 px-5'>
              Cancel
            </Button>
            <Button type='submit' className='bg-violet-600 py-4 px-5'>
              Save changes
            </Button>
          </div>
        </form>
        <div className='bg-white p-4 rounded-lg mt-4 w-[40%] self-stretch'>
          <p className='mt-2 font-medium'>Image preview</p>
          {imageUrl ? (
            <div className='relative w-full h-80 mt-4 rounded-lg overflow-hidden bg-slate-100 border-2 border-dashed border-violet-600'>
              <Image
                src={imageUrl}
                alt='Product preview'
                fill
                className='object-contain rounded-lg'
              />
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center border-2 border-dashed border-violet-600 rounded-lg px-10 py-20 mt-4 bg-slate-100'>
              <ImageLucide className='text-gray-400' size={75} />
              <p className='text-gray-400'>No image</p>
              <p className='text-gray-400 font-medium'>Upload image to see preview</p>
            </div>
          )}
          <div className='p-3 bg-violet-200 mt-4 rounded-lg text-violet-600'>
            <div className='flex items-center justify-start gap-2'>
              <p className='flex items-center justify-center w-5 h-5 rounded-full border-2 border-violet-600 font-semibold'>
                i
              </p>
              <p className='text-violet-600 font-bold'>Editing tips</p>
            </div>
            <ul className='text-violet-600 mt-2 list-disc px-4'>
              <li>Review all changed fields before saving</li>
              <li>Use a clear, high-quality product image</li>
              <li>Make sure category and price are correct</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
