/* eslint-disable no-restricted-globals */

self.onmessage = async (e) => {
  const { type, data } = e.data || {};
  if (type !== 'COMPRESS_IMAGE') return;

  try {
    const { imageDataUri } = data;

    // Create an ImageBitmap from the data URI
    const imageResponse = await fetch(imageDataUri);
    const imageBlob = await imageResponse.blob();
    const imageBitmap = await createImageBitmap(imageBlob);

    // Create an OffscreenCanvas
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');

    // Draw the image to the canvas
    context.drawImage(imageBitmap, 0, 0);

    // Convert the canvas to a compressed JPEG blob
    const compressedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.75 });

    // Convert the blob to a base64 string
    const reader = new FileReader();
    reader.readAsDataURL(compressedBlob);
    reader.onloadend = () => {
      const base64data = reader.result;
      self.postMessage({ type: 'SUCCESS', compressedImage: base64data.split(',')[1] });
    };

  } catch (error) {
    self.postMessage({ type: 'ERROR', error: error instanceof Error ? error.message : 'Failed to compress image' });
  }
};