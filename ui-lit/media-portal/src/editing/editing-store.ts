import { Fetcher } from "../shared/fetcher";
import { ListEditingPostRequest, ListEditingPostResponse, type ListEditingPostResponse_PostData } from "../dto/proto/editing/creating-queries_pb";
import { signal } from "@lit-labs/signals";
import { Session } from "../shared/session";

export class EditingStore {
    listPostFetcher = new Fetcher('poc/editing/cm/list-editing-post');
    posts = signal<Array<ListEditingPostResponse_PostData>>([]);

    constructor() {
        Session.events.addEventListener('post-added', () => {this.listPost();});
    }

	listPost() {
		if (this.listPostFetcher.loading.get()) return;

		this.listPostFetcher.execute(
            new ListEditingPostRequest({}),
            new ListEditingPostResponse(),
		).then((response) => {
            this.posts.set(response.Posts);
        });
	}
}
