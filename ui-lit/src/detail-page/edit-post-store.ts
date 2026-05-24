export class EditPostStore {
	id: bigint = 0n;

	setup(id: string) {
		this.id = BigInt(id);
	}
}
