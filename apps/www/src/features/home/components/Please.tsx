import { FC, useEffect, useRef, useState } from "react";
import {
  extend,
  Canvas as ThreeCanvas,
  useFrame,
  useThree,
} from "@react-three/fiber";
import {
  Image as Image_,
  SpotLight,
  Environment,
  Plane,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { useRelativeOrientationSensor } from "hooks/useDeviceMotion";
import { FrameLimiter } from "@0xflick/components/src/threeFiber/FrameLimiter";
extend({
  ThreeCanvas,
  Image_,
});

export const Please: FC = () => {
  return (
    <>
      <ThreeCanvas
        gl={{ preserveDrawingBuffer: true }}
        dpr={1.5}
        frameloop="demand"
        camera={{ position: [0, 0.5, 6], fov: 35 }}
      >
        <FrameLimiter fps={60} />
        <Content />
      </ThreeCanvas>
    </>
  );
};

function lookingAt(obj: THREE.Object3D) {
  var direction = new THREE.Vector3(0, 0, 3);
  direction.applyMatrix4(obj.matrix);
  return direction;
}

function deviceQuaternionToWorld(quaternion: number[]) {
  const newQuaternion = new THREE.Quaternion(
    quaternion[0],
    quaternion[1],
    quaternion[2],
    quaternion[3]
  )
    // invert the quaternion so that it tracks outside looking in
    .invert()
    // For whatever reason, on my Android I need to rotate here to get the correct orientation
    .multiply(
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1).normalize(),
        Math.PI / 2
      )
    )
    // Lean back a bit to offset flat be holding phone up at an incline
    .multiply(
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0).normalize(),
        Math.PI / 4
      )
    );

  return newQuaternion;
}

const Content = () => {
  const { viewport } = useThree();
  const imageRef = useRef<THREE.Group>(null);
  const spotLightRef = useRef<THREE.SpotLight>(null);
  const [timeoutDeviceMotion, setTimeDeviceMotion] = useState(0);
  const [lastMouse, setLastMouse] = useState<THREE.Vector2 | null>(null);
  const [lastQuaternion, setLastQuaternion] = useState<THREE.Quaternion | null>(
    null
  );

  const { quaternion, started } = useRelativeOrientationSensor();

  useFrame(({ mouse, clock }) => {
    if (!imageRef.current || !spotLightRef.current) {
      return;
    }
    const newMouse = new THREE.Vector2(
      (mouse.x * viewport.width) / 2,
      (mouse.y * viewport.height) / 2
    );

    const delta = clock.getElapsedTime();

    spotLightRef.current.lookAt(imageRef.current.position);

    if ((!lastMouse && mouse) || (lastMouse && !newMouse.equals(lastMouse))) {
      setLastMouse(newMouse);
      if (lastMouse) {
        setTimeDeviceMotion(delta + 2);
      }
      const imageLookingAt = lookingAt(imageRef.current);
      let l = imageLookingAt.lerp(
        new THREE.Vector3(newMouse.x, newMouse.y, 3),
        0.1
      );
      imageRef.current.lookAt(l);
    } else if (
      (started && !lastQuaternion && quaternion) ||
      (lastQuaternion &&
        quaternion.length > 1 &&
        !lastQuaternion.equals(
          new THREE.Quaternion(
            quaternion[0],
            quaternion[1],
            quaternion[2],
            quaternion[3]
          )
        ) &&
        timeoutDeviceMotion <= delta)
    ) {
      const newQuaternion = deviceQuaternionToWorld(quaternion);
      setLastQuaternion(imageRef.current.quaternion.slerp(newQuaternion, 0.2));
    } else if (lastMouse) {
      const imageLookingAt = lookingAt(imageRef.current);
      let l = imageLookingAt.lerp(
        new THREE.Vector3(newMouse.x, newMouse.y, 3),
        0.1
      );
      imageRef.current.lookAt(l);
    } else if (lastQuaternion) {
      const newQuaternion = deviceQuaternionToWorld(quaternion);
      setLastQuaternion(imageRef.current.quaternion.slerp(newQuaternion, 0.2));
    }
  });
  const texture = useTexture("/2887.webp");
  return (
    <>
      <color attach="background" args={["#191920"]} />
      <fog attach="fog" args={["#191920", 0, 15]} />
      <Environment files={"/potsdamer_platz_1k.hdr"} />
      <group ref={imageRef} position={[0, 0, 0]}>
        <Plane args={[1, 1.5]} position={[0, 0, 0.025]}>
          <meshPhysicalMaterial map={texture} roughness={0.1} />
        </Plane>
        <Plane
          args={[0.05, 1.5]}
          position={[-0.5, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <meshPhysicalMaterial color="#666666" roughness={0.1} />
        </Plane>
        <Plane
          args={[0.05, 1.5]}
          position={[0.5, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <meshPhysicalMaterial color="#666666" roughness={0.1} />
        </Plane>
        <Plane
          args={[0.05, 1]}
          position={[0.0, -0.75, 0]}
          rotation={[Math.PI / 2, 0, Math.PI / 2]}
        >
          <meshPhysicalMaterial color="#666666" roughness={0.1} />
        </Plane>
        <Plane
          args={[0.05, 1]}
          position={[0.0, 0.75, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <meshPhysicalMaterial color="#666666" roughness={0.1} />
        </Plane>
      </group>

      <SpotLight
        ref={spotLightRef}
        distance={6}
        angle={0.15}
        attenuation={6}
        anglePower={5} // Diffuse-cone anglePower (default: 5)
        position={[0, 5, 2]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]}>
        <planeGeometry attach="geometry" args={[50, 50]} />
        <meshBasicMaterial attach="material" color="#101010" />
        {/* <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={50}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
          mirror={0}
        /> */}
      </mesh>
    </>
  );
};
