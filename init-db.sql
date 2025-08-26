-- Initialize database for MWIT Print System
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The Prisma migrations will handle table creation
-- This file is here for any initial data or custom functions

-- Insert some default printers (these will be overridden by the Python API)
-- This is just to ensure the system has some initial data

-- Note: Prisma will manage the actual schema
-- Run 'npx prisma db push' after the database is up