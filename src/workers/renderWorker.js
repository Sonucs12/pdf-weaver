// Classic web worker to render PDF pages to JPEG base64 using pdf.js in worker
// Note: Uses UMD build via CDN to avoid bundler issues in classic workers

/* eslint-disable no-restricted-globals */

// Load pdf.js library into worker global scope
// Using unversioned CDN to avoid tight coupling; pin if needed.
// pdf.js will expose global `pdfjsLib` in classic builds.
try {
	importScripts('https://unpkg.com/pdfjs-dist/build/pdf.min.js');
} catch (e) {
	// Fallback CDN
	try {
		importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.js');
	} catch (err) {
		// If loading fails, propagate error on first message
	}
}

self.onmessage = async (e) => {
	const { type, data } = e.data || {};
	if (type !== 'RENDER_PAGES') return;

	try {
		const { pdfDataUri, pageNumbers } = data;
		const pdf = await self.pdfjsLib.getDocument(pdfDataUri).promise;

		const images = [];
		for (let i = 0; i < pageNumbers.length; i++) {
			const pageNum = pageNumbers[i];
			const page = await pdf.getPage(pageNum);
			const viewport = page.getViewport({ scale: 1.5 });

			const canvas = new OffscreenCanvas(viewport.width, viewport.height);
			const context = canvas.getContext('2d');
			if (!context) throw new Error('Could not get canvas context');

			await page.render({ canvasContext: context, viewport }).promise;

			const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.75 });
			const arrayBuffer = await blob.arrayBuffer();
			const bytes = new Uint8Array(arrayBuffer);
			let binary = '';
			for (let j = 0; j < bytes.byteLength; j++) binary += String.fromCharCode(bytes[j]);
			const base64 = btoa(binary);
			images.push(base64);

			self.postMessage({
				type: 'PROGRESS',
				pageNum,
				current: i + 1,
				total: pageNumbers.length,
				preview: `data:image/jpeg;base64,${base64}`,
			});
		}

		self.postMessage({ type: 'SUCCESS', images });
	} catch (error) {
		self.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : 'Failed to render pages' });
	}
};


