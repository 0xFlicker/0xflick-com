import { FC, useState, useEffect } from "react";
import {
  generateAxolotlValleyFromSeed,
  Image,
  renderCanvasCtx,
} from "@0xflick/assets";
import useResizeObserver from "@react-hook/resize-observer";
import { utils } from "ethers";
import { useAppSelector } from "@0xflick/app-store";
import { selectors as configSelectors } from "features/config/redux";
import { Line } from "@react-three/drei";
import { LinearProgress, Paper } from "@mui/material";

export function randomUint8ArrayOfLength(length: number) {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    arr[i] = Math.floor(Math.random() * 256);
  }
  return arr;
}

export const Preview: FC<{
  seed: Uint8Array;
}> = ({ seed }) => {
  const [hidden, setHidden] = useState(true);
  const [progress, setProgress] = useState(0);
  const [canvasEl, setCanvasEl] = useState<null | HTMLCanvasElement>(null);
  const [parentEl, setParentEl] = useState<null | HTMLElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
    top: number;
    left: number;
  }>({ width: 0, height: 0, top: 0, left: 0 });
  const axolotlBaseImages = useAppSelector(configSelectors.axolotlBaseImages);
  useEffect(() => {
    if (!seed) {
      return;
    }
    if (canvasEl) {
      setHidden(true);
      // From seed, generate layers
      generateAxolotlValleyFromSeed(utils.arrayify(seed), async (imagePath) => {
        const image = document.createElement("img");
        image.src = `${axolotlBaseImages}${imagePath}`;
        image.crossOrigin = "Anonymous";
        return new Promise((resolve, reject) => {
          image.onload = () => resolve(image as any);
          image.onerror = () => reject(image);
        });
      }).then(({ layers }) => {
        // Render canvas
        return renderCanvasCtx(
          canvasEl.getContext("2d"),
          layers,
          0,
          0,
          canvasEl.width,
          canvasEl.height,
          (current, total) => setProgress((current / total) * 100)
        ).then(
          () => {
            setHidden(false);
            setProgress(0);
          },
          (err: any) => console.error(err)
        );
      });
    }
    if (canvasEl?.parentElement) {
      setParentEl(canvasEl.parentElement);
    }
  }, [axolotlBaseImages, canvasEl, seed]);
  useResizeObserver(parentEl, (entry) => {
    let left = 0;
    let top = 0;
    let width = entry.contentRect.width;
    let height = entry.contentRect.height;
    if (width / height > 1) {
      // Need to add padding to sides
      const widthOffset = width - height * 1;
      width -= widthOffset;
      left = widthOffset / 2;
    } else {
      // Need to add padding to top and bottom
      const heightOffset = height - width / 1;
      height -= heightOffset;
      top = heightOffset / 2;
    }
    setCanvasDimensions({
      width,
      height,
      top,
      left,
    });
  });

  return (
    <>
      {hidden ? (
        <Paper
          sx={{
            margin: "auto",
            position: "relative",
            width: `${canvasDimensions.width}px`,
            height: `${canvasDimensions.height}px`,
            left: `${canvasDimensions.left}px`,
            top: `${canvasDimensions.top}px`,
            display: "flex",
            flexDirection: "row",
          }}
        >
          <LinearProgress
            variant="determinate"
            value={progress}
            style={{
              margin: "auto",
              width: `${canvasDimensions.width}px`,
            }}
          />
        </Paper>
      ) : undefined}
      <canvas
        ref={setCanvasEl}
        width={569}
        height={569}
        style={{
          margin: "auto",
          opacity: hidden ? 0.0 : 1.0,
          width: `${canvasDimensions.width}px`,
          height: `${canvasDimensions.height}px`,
          left: `${canvasDimensions.left}px`,
          top: `${canvasDimensions.top}px`,
        }}
      />
    </>
  );
};
