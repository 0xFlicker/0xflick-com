export default async function createCanvas(width: number, height: number) {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  throw new Error("createCanvas is not supported outside of the browser");
  // const Canvas = await import("canvas");
  // return Canvas.createCanvas(width, height);
}
