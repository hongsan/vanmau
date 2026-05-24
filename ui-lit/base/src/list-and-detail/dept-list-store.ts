import { Fetcher } from "../shared/fetcher";
import { signal } from "@lit-labs/signals";
import { ListDeptRequest, ListDeptResponse, type ListDeptResponse_DeptData } from "../dto/proto/list-and-detail/list-dept_pb";

export class DeptListStore {
    listDeptFetcher = new Fetcher('base/dept/list-dept');
    depts = signal<Array<ListDeptResponse_DeptData>>([]);
    selected = signal<ListDeptResponse_DeptData | null>(null);

    reset() {
        this.listDeptFetcher.reset();
        this.depts.set([]);
        this.selected.set(null);
    }

    listDept() {
        if (this.listDeptFetcher.loading.get()) return;

        this.listDeptFetcher.execute(
            new ListDeptRequest({}),
            new ListDeptResponse(),
        ).then((response) => {
            this.depts.set(response.Depts);
            if (response.Depts.length > 0) {
                this.selected.set(response.Depts[0]);
            }
        });
    }
}