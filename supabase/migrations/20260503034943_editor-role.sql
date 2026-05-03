-- Add editor value to app_role enum (safe, non-destructive)
ALTER TYPE "public"."app_role" ADD VALUE IF NOT EXISTS 'editor';
