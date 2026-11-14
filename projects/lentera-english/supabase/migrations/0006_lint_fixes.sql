-- Supabase security advisor (function_search_path_mutable): pin the search
-- path of the one function that did not set it. Behaviour is unchanged.
alter function public.cms_table(text) set search_path = public;
