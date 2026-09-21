import { createUploadthing, type FileRouter } from "uploadthing/next";

import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from '@/lib/auth';

const f = createUploadthing();


export const ourFileRouter = {
	imageUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	})
        .middleware(async () => {
            const user = await getCurrentUser();
            if (!user) throw new UploadThingError('Unauthorized');
            return { userId: user.id };
        })
		.onUploadComplete(async ({ file }) => {
			console.log("file url", file.ufsUrl);
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
