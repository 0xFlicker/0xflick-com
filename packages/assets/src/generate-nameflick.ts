import type { Canvas } from "canvas";
import canvasPkg from "canvas";
import createCanvas from "./canvas/canvas";

canvasPkg.registerFont("./fonts/Lato-Regular.ttf", { family: "Lato" });

export async function generateNameflick(name: string, tokenId: number) {
  const canvas = (await createCanvas(1000, 1000)) as Canvas;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#333333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw a rectangle border
  ctx.fillStyle = "#AAAAAA";
  ctx.lineWidth = 20;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Draw the text
  // Eventually measure and resize the text to fit the canvas
  ctx.lineWidth = 1;
  ctx.fillStyle = "#ffffff";
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#000000";
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.font = "96px Lato";
  ctx.textAlign = "left";
  ctx.fillText(name, 64, 878);

  const tokenName = `Nameflick #${tokenId}`;
  ctx.font = "64px Lato";
  ctx.textAlign = "right";
  ctx.fillText(tokenName, 1024 - 64, 128);
  const buffer = canvas.toBuffer("image/png");

  return buffer;
}
