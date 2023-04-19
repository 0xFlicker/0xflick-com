import { FC } from "react";
import { Canvas as ThreeCanvas } from "@react-three/fiber";
import { PropsWithChildren } from "react";
import { FrameLimiter } from "./FrameLimiter";

export const FullscreenCanvas: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <>
      <ThreeCanvas
        gl={{ preserveDrawingBuffer: true }}
        dpr={1.5}
        style={{ height: "100vh", width: "100vw" }}
        frameloop="demand"
        camera={{ position: [0, 0.5, 6], fov: 35 }}
      >
        <FrameLimiter fps={60} />
        {children}
      </ThreeCanvas>
    </>
  );
};
