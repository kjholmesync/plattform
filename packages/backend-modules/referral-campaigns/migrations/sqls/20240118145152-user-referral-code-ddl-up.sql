-- migrate up here: CREATE TABLE...
-- add a referralCode column to the users table
ALTER TABLE "users" ADD COLUMN "referralCode" VARCHAR(255) UNIQUE;
