// Classic web worker: convert ArrayBuffer (PDF) to data: URI with progress updates

/* eslint-disable no-restricted-globals */

self.onmessage = async (e) => {
	const { type, data } = e.data || {};
	if (type !== 'CONVERT_TO_BASE64') return;

	try {
		const { arrayBuffer } = data;
		const uint8Array = new Uint8Array(arrayBuffer);

		const CHUNK_SIZE = 8192;
		let binary = '';

		for (let i = 0; i < uint8Array.byteLength; i += CHUNK_SIZE) {
			const chunk = uint8Array.subarray(i, Math.min(i + CHUNK_SIZE, uint8Array.byteLength));
			binary += String.fromCharCode.apply(null, Array.from(chunk));

			const progress = Math.round((i / uint8Array.byteLength) * 100);
			self.postMessage({ type: 'PROGRESS', progress });
		}

		const base64 = btoa(binary);
		const dataUri = `data:application/pdf;base64,${base64}`;

		self.postMessage({ type: 'SUCCESS', dataUri });
	} catch (error) {
		self.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : 'Failed to convert PDF' });
	}
};


