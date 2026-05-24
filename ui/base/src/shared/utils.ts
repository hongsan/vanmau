export function formatDateTime(date: Date | undefined): string {
	if (!date) return '';
	const pad = (num: number) => String(num).padStart(2, '0');
	const hours = pad(date.getHours());
	const minutes = pad(date.getMinutes());
	const seconds = pad(date.getSeconds());
	const day = pad(date.getDate());
	const month = pad(date.getMonth() + 1);
	const year = date.getFullYear();
	return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}

export function formatDate(timestamp: any): string {
	if (!timestamp) return '';
	const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
	if (isNaN(date.getTime())) return '';
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

export type RuntimeEnvironment = 'dev' | 'stage' | 'prod';

const DIAGRAM_FEATURE_RELEASE_AT = new Date('2026-04-16T00:00:00+07:00');

function detectEnvironmentFromSource(source: string): RuntimeEnvironment | null {
	const normalized = source.trim().toLowerCase();
	if (!normalized) return null;

	if (
		normalized === 'mocking'
		|| normalized.includes('localhost')
		|| normalized.includes('127.0.0.1')
		|| normalized.includes('ilv2-dev')
		|| normalized.includes('.dev')
		|| normalized.includes('-dev')
		|| normalized.includes('dev.')
	) {
		return 'dev';
	}

	if (
		normalized.includes('ilv2-stg')
		|| normalized.includes('stg')
		|| normalized.includes('stage')
		|| normalized.includes('staging')
	) {
		return 'stage';
	}

	return 'prod';
}

export function getRuntimeEnvironment(baseUrl?: string): RuntimeEnvironment {
	const sources = [
		typeof window !== 'undefined' ? window.location.hostname : '',
		typeof window !== 'undefined' ? window.location.origin : '',
		baseUrl ?? '',
		(import.meta.env.VITE_BASE_URL as string | undefined) ?? '',
	];

	for (const source of sources) {
		const environment = detectEnvironmentFromSource(source);
		if (environment) return environment;
	}

	return 'prod';
}

export function canUseThisFeatures(now: Date = new Date(), baseUrl?: string): boolean {
	const environment = getRuntimeEnvironment(baseUrl);
	if (environment === 'dev') return true;
	return now.getTime() >= DIAGRAM_FEATURE_RELEASE_AT.getTime();
}

type SortableId = string | number | bigint;

export function sortItemsByIdOrder<T>(
	items: T[],
	idOrder: SortableId[],
	getId: (item: T) => SortableId | undefined | null,
): T[] {
	const indexMap = new Map<string, number>();
	idOrder.forEach((id, i) => {
		const key = String(id);
		if (!indexMap.has(key)) indexMap.set(key, i);
	});

	return items
		.map((item, originalIndex) => {
			const id = getId(item);
			const key = id === undefined || id === null ? '' : String(id);
			const orderIndex = indexMap.has(key) ? (indexMap.get(key) as number) : Number.POSITIVE_INFINITY;
			return { item, orderIndex, originalIndex };
		})
		.sort((a, b) => {
			if (a.orderIndex === b.orderIndex) return a.originalIndex - b.originalIndex;
			return a.orderIndex - b.orderIndex;
		})
		.map((x) => x.item);
}
