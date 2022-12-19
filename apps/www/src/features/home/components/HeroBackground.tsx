import { FC, useRef, useMemo, useState, forwardRef } from "react";
import {
  extend,
  Canvas as ThreeCanvas,
  useThree,
  useFrame,
} from "@react-three/fiber";
import { FrameLimiter } from "@0xflick/components/src/threeFiber/FrameLimiter";
import {
  Box,
  Cylinder,
  Html,
  Scroll,
  ScrollControls,
  useScroll,
} from "@react-three/drei";
import { Group, MathUtils } from "three";
import { Typography } from "@mui/material";
extend({
  ThreeCanvas,
  Cylinder,
  Html,
});

// Can't seem to find where this comes from in drei
type HtmlProps = any;

export const HeroBackground: FC<{}> = ({}) => {
  return (
    <ThreeCanvas
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      gl={{ preserveDrawingBuffer: true }}
      dpr={1.5}
      camera={{ position: [0, 0.5, 6], fov: 35 }}
    >
      <FrameLimiter fps={60} />
      <ScrollControls distance={0.25} damping={10} pages={1}>
        <Scroll>
          <Content />
        </Scroll>
      </ScrollControls>
    </ThreeCanvas>
  );
};

const Tag = forwardRef<HTMLDivElement, { label: string } & HtmlProps>(
  function TagComponent({ label, ...props }, ref) {
    return (
      <Html
        ref={ref}
        style={{
          pointerEvents: "none",
          transition: "opacity 0.5s cubic-bezier(0.61, 1, 0.88, 1)",
          // opacity: 0,
          // display: "grid",
          // position: "relative",
          alignItems: "end",
          lineHeight: "1em",
          gap: "1em",
          overflow: "hidden",
          height: "12.5vw",
        }}
        center
        {...props}
      >
        <Typography>{label}</Typography>
      </Html>
    );
  }
);

const NODE_RADIUS = 0.5;
const NODE_HEIGHT = 0.1;
const Node: FC<{
  label: string;
  distance: number;
  position: [number, number, number];
}> = ({ label, distance, position }) => {
  // The larger the distance, the fewer the triangles
  // Close up: 32, far away: 4
  const distanceFactor = 32 - Math.min(0, Math.max(28, distance));
  return (
    <Cylinder
      position={position}
      scale={[1, 1, 1]}
      args={[NODE_RADIUS, NODE_RADIUS, NODE_HEIGHT, distanceFactor, 1, false]}
    >
      <meshPhysicalMaterial attach="material" color="#666666" roughness={0.1} />
      <Tag label={label} />
    </Cylinder>
  );
};

const Connector: FC<{
  nodePos1: [number, number, number];
  nodePos2: [number, number, number];
}> = ({ nodePos1, nodePos2 }) => {
  const position = useMemo(
    () =>
      [
        (nodePos1[0] + nodePos2[0]) / 2,
        (nodePos1[1] + nodePos2[1]) / 2,
        (nodePos1[2] + nodePos2[2]) / 2,
      ] as [number, number, number],
    [nodePos1, nodePos2]
  );
  const distance = useMemo(
    () =>
      Math.sqrt(
        Math.pow(nodePos1[0] - nodePos2[0], 2) +
          Math.pow(nodePos1[1] - nodePos2[1], 2) +
          Math.pow(nodePos1[2] - nodePos2[2], 2)
      ) -
      2 * NODE_RADIUS,
    [nodePos1, nodePos2]
  );
  //rotation puts the cylinder between the two nodes
  const rotation = useMemo(
    () =>
      [
        Math.atan2(nodePos2[1] - nodePos1[1], nodePos2[0] - nodePos1[0]),
        -Math.atan2(nodePos2[2] - nodePos1[2], nodePos2[0] - nodePos1[0]),
        0,
      ] as [number, number, number],
    [nodePos1, nodePos2]
  );
  return (
    <Box position={position} rotation={rotation} args={[distance, 0.01, 0.01]}>
      <meshPhysicalMaterial
        attach="material"
        color="#666666"
        roughness={0.1}
        emissive={"#ffffff"}
      />
    </Box>
  );
};

const NODE_MAP: [number, number, number][] = [
  [0, 0, -1],
  [2, 0, 1],
  [-2, 0, 1],
];
const Content: FC = () => {
  const scroll = useScroll();
  const { camera, invalidate } = useThree();
  const nodeGroupRef = useRef<Group>();

  const [center, setCenter] = useState<[number, number, number]>([0, 0, 0]);
  const distanceToCamera = useMemo(() => {
    return Math.sqrt(
      Math.pow(camera.position.x - center[0], 2) +
        Math.pow(camera.position.y - center[1], 2) +
        Math.pow(camera.position.z - center[2], 2)
    );
  }, [camera.position, center]);

  useFrame((state, delta) => {
    if (nodeGroupRef.current && scroll) {
      // As scroll goes up, the nodes get closer to the camera
      // As scroll goes down, the nodes get farther from the camera
      const group = nodeGroupRef.current;
      const r1 = scroll.range(0, 3 / 4);
      const r2 = scroll.range(1 / 2, 1);
      group.rotation.x = MathUtils.damp(
        group.rotation.x,
        (Math.PI / 1.95) * r1,
        4,
        delta
      );
      camera.position.z = MathUtils.damp(
        camera.position.z,
        6 + r2 * 6,
        4,
        delta
      );
      // const distanceFactor = Math.min(
      //   0,
      //   Math.max(28, distanceToCamera - scroll.offset)
      // );
      // nodeGroupRef.current.scale.setScalar(1 + distanceFactor / 28);
    }
  });
  return (
    <>
      <ambientLight />
      <group
        ref={nodeGroupRef}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <Node
          label="fruit.eth"
          distance={distanceToCamera}
          position={NODE_MAP[0]}
        />
        <Node
          label="banana"
          distance={distanceToCamera}
          position={NODE_MAP[1]}
        />
        <Connector nodePos1={NODE_MAP[0]} nodePos2={NODE_MAP[1]} />
        <Node
          label="apple"
          distance={distanceToCamera}
          position={NODE_MAP[2]}
        />
        <Connector nodePos2={NODE_MAP[0]} nodePos1={NODE_MAP[2]} />
      </group>
    </>
  );
};
