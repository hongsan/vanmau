import { Fetcher } from "../shared/fetcher";
import { signal } from "@lit-labs/signals";
import { GetDeptRequest, GetDeptResponse } from "../dto/proto/list-and-detail/get-dept_pb";

export class DeptDetailStore {
    getDeptFetcher = new Fetcher('base/dept/get-dept');
    dept = signal<GetDeptResponse>(new GetDeptResponse());
    id: bigint= 0n;

    setup(id: bigint) {
        this.id = id;
        this.getDeptFetcher.reset();
        this.dept.set(new GetDeptResponse());

    }

    getDept() {
        if (this.getDeptFetcher.loading.get()) return;

        this.getDeptFetcher.execute(
            new GetDeptRequest({DeptID: this.id}),
            new GetDeptResponse(),
        ).then((response) => {
            this.dept.set(response);
        });
    }
}