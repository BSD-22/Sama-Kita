import ImageKit from 'imagekit';

if (!process.env.PUBLIC_IMAGEKIT_KEY || !process.env.PRIVATE_IMAGEKIT_KEY || !process.env.IMAGEKIT_URL) {
  throw new Error('Missing ImageKit environment variables.');
}

export const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_IMAGEKIT_KEY,
  privateKey: process.env.PRIVATE_IMAGEKIT_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL,
});
