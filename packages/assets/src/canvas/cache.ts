import type { Image } from "canvas";

const imageBufferCache = new Map<string, Image>();

export interface IImageFetcher {
  (key: string): Promise<Image>;
}

export async function getImage(
  imgPath: string,
  imageFetcher: IImageFetcher
): Promise<Image> {
  if (imageBufferCache.has(imgPath)) {
    return imageBufferCache.get(imgPath) as Image;
  }
  const img = await imageFetcher(imgPath);
  imageBufferCache.set(imgPath, img);
  return img;
}
