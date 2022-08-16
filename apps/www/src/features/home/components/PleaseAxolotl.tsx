import { FC, useCallback, useMemo, useRef, useState } from "react";
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
} from "@react-three/drei";
import * as THREE from "three";
import { useRelativeOrientationSensor } from "hooks/useDeviceMotion";
import { FrameLimiter } from "components/threeFiber/FrameLimiter";
import { useOffscreenCanvas } from "features/axolotlValley/hooks/useOffscreenCanvas";
extend({
  ThreeCanvas,
  Image_,
});

export const PleaseAxolotl: FC<{
  seed: Uint8Array;
}> = ({ seed }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const onComplete = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      const newCanvas = document.createElement("canvas");
      newCanvas.width = 512;
      newCanvas.height = 512;
      const newCtx = newCanvas.getContext("2d");
      newCtx.drawImage(canvas, 0, 0, 569, 569, 0, 0, 512, 512);
      setCanvas(newCanvas);
    } else {
      setCanvas(null);
    }
  }, []);
  useOffscreenCanvas({
    seed,
    height: 569,
    width: 569,
    onComplete,
  });
  return (
    <>
      <ThreeCanvas
        gl={{ preserveDrawingBuffer: true }}
        dpr={1.5}
        frameloop="demand"
        camera={{ position: [0, 0.5, 6], fov: 35 }}
      >
        <FrameLimiter fps={60} />
        <Content canvas={canvas} />
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

const DIMENSIONS = 2;
const ASPECT_RATIO = 1;
const Content: FC<{ canvas: HTMLCanvasElement | null }> = ({ canvas }) => {
  const { viewport, gl } = useThree();
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

  const texture = useMemo(() => {
    if (!canvas) {
      return null;
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
    texture.flipY = true;
    return texture;
  }, [canvas, gl.capabilities]);
  return (
    <>
      <color attach="background" args={["#191920"]} />
      <fog attach="fog" args={["#191920", 0, 15]} />
      <Environment files={"/potsdamer_platz_1k.hdr"} />

      <group ref={imageRef} position={[0, 0, 0]}>
        <Plane args={[DIMENSIONS, DIMENSIONS]} position={[0, 0, 0.025]}>
          <meshPhysicalMaterial roughness={0.15} map={texture}>
            <canvasTexture attach="map" image={canvas} flipY needsUpdate />
          </meshPhysicalMaterial>
        </Plane>
        <Plane
          args={[0.05, DIMENSIONS]}
          position={[-DIMENSIONS / 2, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <meshPhysicalMaterial color="#666666" roughness={0.1} />
        </Plane>
        <Plane
          args={[0.05, DIMENSIONS]}
          position={[DIMENSIONS / 2, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <meshPhysicalMaterial color="#666666" roughness={0.1} />
        </Plane>
        <Plane
          args={[0.05, DIMENSIONS]}
          position={[0.0, -DIMENSIONS / 2, 0]}
          rotation={[Math.PI / 2, 0, Math.PI / 2]}
        >
          <meshPhysicalMaterial color="#666666" roughness={0.1} />
        </Plane>
        <Plane
          args={[0.05, DIMENSIONS]}
          position={[0.0, DIMENSIONS / 2, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <meshPhysicalMaterial color="#666666" roughness={0.1} />
        </Plane>
      </group>

      <SpotLight
        ref={spotLightRef}
        distance={8}
        angle={0.15}
        attenuation={6}
        anglePower={5} // Diffuse-cone anglePower (default: 5)
        position={[0, 7, 2]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry attach="geometry" args={[50, 50]} />
        <meshBasicMaterial attach="material" color="#101010" />
      </mesh>
    </>
  );
};
