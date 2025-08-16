-- Create file_metadata table to store file information
CREATE TABLE "file_metadata" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "object_id" varchar NOT NULL UNIQUE,
  "original_name" text NOT NULL,
  "mime_type" varchar NOT NULL,
  "extension" varchar NOT NULL,
  "file_path" text NOT NULL,
  "file_size" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create index for faster lookups by object_id
CREATE INDEX "idx_file_metadata_object_id" ON "file_metadata" ("object_id");

-- Create index for mime_type filtering
CREATE INDEX "idx_file_metadata_mime_type" ON "file_metadata" ("mime_type");