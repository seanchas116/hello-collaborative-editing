ALTER TABLE "permissions" ALTER COLUMN "userId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "fileId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_userId_fileId_pk" PRIMARY KEY("userId","fileId");--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN IF EXISTS "type";