// Get dynamic base path from <base> tag
function getBasePath(): string {
	const baseHref = document.querySelector('base')?.getAttribute('href') ?? '/';
	return baseHref === '/' ? '' : baseHref.replace(/\/$/, '');
}

export function navigate(
	url: string,
	options: { replace?: boolean } = {}
) {
	const basePath = getBasePath();
	const fullUrl = url.startsWith('/') ? basePath + url : url;

	if (options.replace) {
		history.replaceState(null, '', fullUrl);
	} else {
		history.pushState(null, '', fullUrl);
	}
	window.dispatchEvent(new PopStateEvent('popstate'));
}

export function navigateReplace(url: string) {
	const basePath = getBasePath();
	const fullUrl = url.startsWith('/') ? basePath + url : url;
	window.location.replace(fullUrl);
}
