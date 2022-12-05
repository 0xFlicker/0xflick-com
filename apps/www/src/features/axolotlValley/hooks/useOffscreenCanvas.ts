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

export const useOffscreenCanvas = ({
  seed,
  width,
  height,
  onComplete,
}: {
  seed: Uint8Array;
  height: number;
  width: number;
  onComplete: (canvas: HTMLCanvasElement | null) => void;
}) => {
  const axolotlBaseImages = useAppSelector(configSelectors.axolotlBaseImages);
  useEffect(() => {
    if (!seed) {
      return;
    }
    let cancelled = false;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
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
        canvas.getContext("2d"),
        layers,
        0,
        0,
        width,
        height
      ).then(
        () => {
          if (!cancelled) onComplete(canvas);
        },
        (err: any) => console.error(err)
      );
    });
    return () => {
      cancelled = true;
      onComplete(null);
    };
  }, [axolotlBaseImages, height, onComplete, seed, width]);
};
