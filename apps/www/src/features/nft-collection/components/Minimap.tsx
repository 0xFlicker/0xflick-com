import * as THREE from "three";
import { useRef, FC } from "react";
import { useFrame, useThree, extend, Object3DNode } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { IOwnedToken } from "models/nfts";

extend({ Line_: THREE.Line, Group_: THREE.Group });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      line_: Object3DNode<THREE.Line, typeof THREE.Line>;
      group_: Object3DNode<THREE.Group, typeof THREE.Group>;
    }
  }
}
const material = new THREE.LineBasicMaterial({ color: "black" });
const geometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, -0.5, 0),
  new THREE.Vector3(0, 0.5, 0),
]);

export const Minimap: FC<{
  ownedTokens: unknown[];
  isDarkMode: boolean;
}> = ({ ownedTokens, isDarkMode }) => {
  const ref = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const { height } = useThree((state) => state.viewport);
  useFrame((state, delta) => {
    if (ref.current && ref.current.children?.length > 0) {
      const color = material.color;
      const level = THREE.MathUtils.damp(
        color.r,
        isDarkMode ? 1 : 0,
        10,
        delta
      );
      color.r = level;
      color.g = level;
      color.b = level;
      ref.current.children.forEach((child, index) => {
        // Give me a value between 0 and 1
        //   starting at the position of my item
        //   ranging across 4 / total length
        //   make it a sine, so the value goes from 0 to 1 to 0.

        if (child.scale) {
          const y = scroll.curve(
            index / ownedTokens.length - 1.5 / ownedTokens.length,
            4 / ownedTokens.length
          );
          const scale = child.scale;
          scale.y = THREE.MathUtils.damp(scale.y, 0.1 + y / 6, 8, delta);
        }
      });
    }
  });
  return (
    <group_ ref={ref}>
      {ownedTokens.map((_, i) => (
        <line_
          key={i}
          geometry={geometry}
          material={material}
          position={[
            i * 0.06 - ownedTokens.length * 0.03,
            -height / 2 + 0.6,
            0,
          ]}
        />
      ))}
    </group_>
  );
};
