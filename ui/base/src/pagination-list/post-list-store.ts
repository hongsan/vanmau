import { Fetcher } from "../shared/fetcher";
import { signal } from "@lit-labs/signals";
import { ListPostRequest, ListPostResponse, type ListPostResponse_PostData } from "../dto/proto/pagination-list/list-post_pb";
import { SearchPostRequest, SearchPostResponse, type SearchPostResponse_PostData } from "../dto/proto/pagination-list/search-post_pb";

export class PostListStore {
    listPostFetcher = new Fetcher('base/post/list-post');
    posts = signal<Array<ListPostResponse_PostData>>([]);

    currentPage = signal(1);
    lastPage= signal(false);
    positions: Uint8Array<ArrayBuffer>[] = [];

    searching = signal(false);
    founds = signal<Array<SearchPostResponse_PostData> | null>(null);
    searchPostFetcher = new Fetcher('base/post/search-post');

    setup() {
        this.listPostFetcher.reset();
        this.posts.set([]);
        this.currentPage.set(1);
        this.lastPage.set(false);
        this.positions = [];
        this.searching.set(false);
    }

	listPost() {
		if (this.listPostFetcher.loading.get()) return;

		this.listPostFetcher.execute(
            new ListPostRequest({
                Count: 10,
                Position: this.positions[this.positions.length - 1] || new Uint8Array()
            }),
            new ListPostResponse(),
		).then((response) => {
            if (response.Posts.length === 0) {
                this.lastPage.set(true);
                this.positions.push(new Uint8Array());
            } else {
                this.posts.set(response.Posts);
                this.positions.push(response.LastPosition);
                if (response.LastPosition.length === 0) this.lastPage.set(true);
                else this.lastPage.set(false);
            }
        });
	}

    nextPage() {
        if (this.listPostFetcher.loading.get() || this.lastPage.get()) return;
        this.currentPage.set(this.currentPage.get() + 1);
        this.listPost();
    }
    
    previousPage() {
        if (this.listPostFetcher.loading.get() || this.currentPage.get() === 1) return;
        this.currentPage.set(this.currentPage.get() - 1);
        this.positions.pop();
        this.listPost();
    }

    startSearch() {
        this.searchPostFetcher.reset();
        this.searching.set(true);
    }

    endSearch() {
        this.searchPostFetcher.reset();
        this.searching.set(false);
        this.founds.set(null);
    }

    searchPosts(query: string) {
        if (this.searchPostFetcher.loading.get()) return;

        this.searchPostFetcher.execute(
            new SearchPostRequest({Query: query}),
            new SearchPostResponse(),
        ).then((response) => {
            this.founds.set(response.Posts);
        });
    }
}