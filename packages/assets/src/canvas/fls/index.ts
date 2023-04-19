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
