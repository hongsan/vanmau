import { Fetcher } from "../shared/fetcher";
import { signal } from "@lit-labs/signals";
import { Session } from "../shared/session";
import { ListPostRequest, ListPostResponse, type ListPostResponse_PostData } from "../dto/proto/pagination-list/list-post_pb";

export class PostListStore {
    listPostFetcher = new Fetcher('base/post/list-post');
    posts = signal<Array<ListPostResponse_PostData>>([]);

    constructor() {
        Session.events.addEventListener('post-added', () => {this.listPost();});
    }

	listPost() {
		if (this.listPostFetcher.loading.get()) return;

		this.listPostFetcher.execute(
            new ListPostRequest({}),
            new ListPostResponse(),
		).then((response) => {
            this.posts.set(response.Posts);
        });
	}
}