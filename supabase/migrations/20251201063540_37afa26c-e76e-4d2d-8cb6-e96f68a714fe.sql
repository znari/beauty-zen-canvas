-- Enable Row Level Security on room tables
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for room_members
-- Users can only see and manage their own room memberships
CREATE POLICY "Users can view own room memberships"
ON public.room_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own room memberships"
ON public.room_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own room memberships"
ON public.room_members
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own room memberships"
ON public.room_members
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create RLS policies for room_messages
-- Users can only see messages in rooms they are members of
CREATE POLICY "Users can view messages in their rooms"
ON public.room_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_members.room_id = room_messages.room_id
    AND room_members.user_id = auth.uid()
  )
);

-- Users can only insert messages as themselves
CREATE POLICY "Users can send messages in their rooms"
ON public.room_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.room_members
    WHERE room_members.room_id = room_messages.room_id
    AND room_members.user_id = auth.uid()
  )
);

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
ON public.room_messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
ON public.room_messages
FOR DELETE
TO authenticated
USING (sender_id = auth.uid());