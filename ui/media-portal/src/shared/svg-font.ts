const BASE64_CONTENT_PATTERN = /^[A-Za-z0-9+/=]+$/;

function toBase64(value: string): string {
	const normalized = value.trim().replace(/\s+/g, '');
	const isLikelyBase64 = normalized.length > 0
		&& normalized.length % 4 === 0
		&& BASE64_CONTENT_PATTERN.test(normalized);

	if (isLikelyBase64) {
		return normalized;
	}

	const bytes = new TextEncoder().encode(value);
	let binary = '';
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

export function replaceSvgFontPlaceholder(svgMarkup: string, fontSource: string): string {
	if (!svgMarkup) return svgMarkup;
	if (!svgMarkup.includes('FONT_BASE64')) return svgMarkup;

	const fontBase64 = toBase64(fontSource);
	const fontDataUri = `data:font/ttf;base64,${fontBase64}`;

	return svgMarkup.split('FONT_BASE64').join(fontDataUri);
}
