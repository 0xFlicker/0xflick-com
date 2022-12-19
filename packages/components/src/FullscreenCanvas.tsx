import { FC, PropsWithChildren, useState } from "react";
import { extend, Canvas as ThreeCanvas } from "@react-three/fiber";
import { FrameLimiter } from "components/threeFiber/FrameLimiter";
extend({
  ThreeCanvas,
});

export const FullscreenCanvas: FC<
  PropsWithChildren<{
    cameraPosition?: [number, number, number];
    cameraFov?: number;
  }>
> = ({ cameraPosition = [0, 0.5, 6], cameraFov = 35, children }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  return (
    <>
      <ThreeCanvas
        gl={{ preserveDrawingBuffer: true }}
        dpr={1.5}
        frameloop="demand"
        camera={{ position: cameraPosition, fov: cameraFov }}
      >
        <FrameLimiter fps={60} />
        {children}
      </ThreeCanvas>
    </>
  );
};
