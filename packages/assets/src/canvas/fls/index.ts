import { IPFSHTTPClient } from "ipfs-http-client";
import { Image, CanvasRenderingContext2D, Canvas, loadImage } from "canvas";
import createCanvas from "../canvas";

async function loadIpfsContent(ipfsClient: IPFSHTTPClient, ipfsCid: string) {
  const contents: Uint8Array[] = [];
  for await (const metadataBuf of ipfsClient.cat(ipfsCid)) {
    contents.push(metadataBuf);
  }
  return Buffer.concat(contents);
}

async function createImageBitmap(imageBuffer: Buffer) {
  return loadImage(imageBuffer);
}

export async function flip({
  ipfsHttpClient,
  ipfsCid,
}: {
  ipfsHttpClient: IPFSHTTPClient;
  ipfsCid: string;
}) {
  console.log("Loading image from IPFS", ipfsCid);
  const jsonBuffer = await loadIpfsContent(ipfsHttpClient, ipfsCid);
  const metadata = JSON.parse(jsonBuffer.toString());
  const imageCid = metadata.image.split("ipfs://")[1];
  console.log("Loading image buffer from IPFS", imageCid);
  const imageBuffer = await loadIpfsContent(ipfsHttpClient, imageCid);
  console.log("Creating image bitmap");
  const img = await createImageBitmap(imageBuffer);
  console.log("Creating canvas");
  const canvas: Canvas = (await createCanvas(img.width, img.height)) as Canvas;
  console.log("Drawing image");
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
  // Draw the image flipped horizontally
  ctx.translate(img.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0);
  console.log("Returning image");
  return canvas.toBuffer("image/png");
}

export async function resizeImage({
  ipfsHttpClient,
  ipfsCid,
  width,
  height,
}: {
  ipfsHttpClient: IPFSHTTPClient;
  ipfsCid: string;
  width: number;
  height: number;
}) {
  console.log("Loading image from IPFS", ipfsCid);
  const jsonBuffer = await loadIpfsContent(ipfsHttpClient, ipfsCid);
  const metadata = JSON.parse(jsonBuffer.toString());
  const imageCid = metadata.image.split("ipfs://")[1];
  console.log("Loading image buffer from IPFS", imageCid);
  const imageBuffer = await loadIpfsContent(ipfsHttpClient, imageCid);
  console.log("Creating image bitmap");
  const img = await createImageBitmap(imageBuffer);
  console.log("Creating canvas");
  const canvas: Canvas = (await createCanvas(width, height)) as Canvas;
  console.log("Drawing image");
  const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, width, height);
  console.log("Returning image");
  return canvas.toBuffer("image/png");
}

function calculateRowsAndColumns(numImages: number) {
  let numRows = Math.floor(Math.sqrt(numImages));
  let numCols = Math.ceil(numImages / numRows);

  while (numRows * numCols < numImages) {
    numRows += 1;
  }

  return { numRows, numCols };
}

export async function generateMosaic({ images }: { images: Image[] }) {
  const { numRows, numCols } = calculateRowsAndColumns(images.length);

  const imgWidth = images[0].width;
  const imgHeight = images[0].height;

  const mosaicWidth = numCols * imgWidth;
  const mosaicHeight = numRows * imgHeight;

  const maxCanvasSize = 2000;
  const widthScaleFactor = maxCanvasSize / mosaicWidth;
  const heightScaleFactor = maxCanvasSize / mosaicHeight;

  let scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);

  const canvas = (await createCanvas(
    mosaicWidth * scaleFactor,
    mosaicHeight * scaleFactor
  )) as Canvas;
  const ctx = canvas.getContext("2d");
  ctx.scale(scaleFactor, scaleFactor);

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const index = i * numCols + j;
      if (index < images.length) {
        ctx.drawImage(
          images[index],
          j * imgWidth,
          i * imgHeight,
          imgWidth,
          imgHeight
        );
      }
    }
  }

  return canvas;
}
