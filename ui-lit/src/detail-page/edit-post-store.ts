import { signal } from "@lit-labs/signals";
import { GetPostRequest, GetPostResponse } from "../dto/proto/detail-page/get-post_pb";
import { Fetcher } from "../shared/fetcher";

export class EditPostStore {
	id: bigint = 0n;

	getPostFetcher = new Fetcher("base/post/get-post");
	post = signal<GetPostResponse>(new GetPostResponse());

	setup(id: string) {
		this.id = BigInt(id);
	}

	load() {
		this.getPostFetcher.execute(
			new GetPostRequest({PostID: this.id}), 
			new GetPostResponse()
		).then((response) => {
			this.post.set(response);
		});
	}
}
