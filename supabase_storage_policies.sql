-- Run this in Supabase SQL Editor to allow image uploads from your Next.js app

-- 1. Allow anyone (anon + authenticated) to INSERT into product-images bucket
CREATE POLICY "Allow public uploads to product-images"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

-- 2. Allow anyone to SELECT (read) from product-images bucket
CREATE POLICY "Allow public reads from product-images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

-- 3. Allow authenticated users to DELETE their own uploads
CREATE POLICY "Allow authenticated deletes from product-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
