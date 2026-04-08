-- Fix vehicle_reviews RLS to allow any user (even unauthenticated) to insert reviews.
-- This enables "any user can add a review to any vehicle" as required.

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Authenticated Insert Reviews" ON public.vehicle_reviews;

-- Allow anyone (including anon) to insert reviews
CREATE POLICY "Public Insert Reviews" ON public.vehicle_reviews
    FOR INSERT WITH CHECK (true);

-- (Optional) Allow authenticated users to delete their own reviews
DROP POLICY IF EXISTS "Delete Own Reviews" ON public.vehicle_reviews;
CREATE POLICY "Delete Own Reviews" ON public.vehicle_reviews
    FOR DELETE USING (auth.uid() = user_id);
