export function handleDrawerKeydown(
	e: KeyboardEvent,
	isLoading: boolean,
	onEnter?: () => void,
) {
	if (e.key === 'Escape' && isLoading) {
		e.preventDefault();
		e.stopPropagation();
		return;
	}

	if (e.key !== 'Enter') return;
	const path = e.composedPath();
	const isTextarea = path.some((el) => {
		const tagName = (el as HTMLElement)?.tagName?.toLowerCase();
		return tagName === 'textarea' || tagName === 'wa-textarea';
	});
	if (isTextarea) return;

	e.preventDefault();
	onEnter?.();
}

export function handleDrawerRequestClose(e: Event, isLoading: boolean) {
	if (!isLoading) return;
	e.preventDefault();
	e.stopPropagation();
}
