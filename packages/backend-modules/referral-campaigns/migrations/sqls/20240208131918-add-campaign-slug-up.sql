-- migrate up here: CREATE TABLE...
ALTER TABLE "campaigns" ADD COLUMN "slug" VARCHAR(255) UNIQUE