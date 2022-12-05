import * as THREE from "three";
import {
  useRef,
  useMemo,
  useState,
  FC,
  useCallback,
  PropsWithChildren,
  Suspense,
} from "react";
import {
  Canvas as ThreeCanvas,
  useFrame,
  useThree,
  extend,
} from "@react-three/fiber";
import {
  Image as Image_,
  ScrollControls,
  Scroll,
  useScroll,
  useTexture,
} from "@react-three/drei";
import { useAppSelector } from "@0xflick/app-store";
import { selectors as appbarSelectors } from "features/appbar/redux";
import { Minimap } from "./Minimap";

import { INfts, IOwnedToken } from "@0xflick/models";
import { useGetNftCollectionQuery } from "../api";
import { shuffle } from "utils/random";

const { damp } = THREE.MathUtils;
extend({ Image_ });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      Image_: typeof Image_;
    }
  }
}

const PRELOAD_AMOUNT = 12;

const ItemsScrollContainer: FC<
  PropsWithChildren<{
    setOffset: (offset: number) => void;
    start: number;
    end: number;
    ownedTokens: IOwnedToken[];
  }>
> = ({ children, setOffset, start, end, ownedTokens }) => {
  const scroll = useScroll();
  useFrame((state, delta) => {
    // console.log(
    //   `${(start / ownedTokens.length).toFixed(3)} ${scroll.offset.toFixed(
    //     3
    //   )} ${(end / ownedTokens.length).toFixed(3)}`
    // );
    if (
      // !scroll.visible(
      //   start / ownedTokens.length,
      //   (start + 1) / ownedTokens.length
      // )
      scroll.offset >
        start / ownedTokens.length + PRELOAD_AMOUNT / 2 / ownedTokens.length &&
      start < ownedTokens.length - PRELOAD_AMOUNT
    ) {
      // console.log("preload", start + 1);
      setOffset(start + 1);
    } else if (
      scroll.offset <
      (start - 1) / ownedTokens.length + PRELOAD_AMOUNT / 2 / ownedTokens.length
    ) {
      if (start > 0) {
        setOffset(start - 1);
      }
    }
  });

  return <>{children}</>;
};

const Item: FC<{
  index: number;
  position: THREE.Vector3Tuple;
  scale: THREE.Vector3Tuple;
  selectedScale: THREE.Vector3Tuple;
  c?: THREE.Color;
  url: string;
  clicked: number | null;
  setClicked: (index: number | null) => void;
  ownedTokens: IOwnedToken[];
  w: number;
}> = ({
  index,
  position,
  clicked,
  scale,
  selectedScale,
  setClicked,
  c = new THREE.Color(),
  url,
  ownedTokens,
  w,
}) => {
  const ref = useRef<any>(null);
  const [hovered, hover] = useState(false);
  const scroll = useScroll();
  const click = useCallback(() => {
    setClicked(index === clicked ? null : index);
  }, [index, setClicked, clicked]);
  const over = () => hover(true);
  const out = () => hover(false);
  useFrame((state, delta) => {
    if (ref.current && ownedTokens.length > 0) {
      let delta = 1.5;
      if (clicked !== null && index < clicked) {
        delta += 1;
      }
      if (clicked !== null && index > clicked) {
        delta -= 1;
      }
      const y = scroll.curve(
        index / ownedTokens.length - delta / ownedTokens.length,
        4 / ownedTokens.length
      );
      ref.current.material.scale[1] = ref.current.scale.y = damp(
        ref.current.scale.y,
        clicked === index ? selectedScale[1] : scale[1] + y,
        1,
        delta
      );
      ref.current.material.scale[0] = ref.current.scale.x = damp(
        ref.current.scale.x,
        clicked === index ? selectedScale[0] : scale[0],
        1,
        delta
      );
      // console.log(ref.current.frustumCulled);
      if (clicked !== null && index < clicked)
        ref.current.position.x = damp(
          ref.current.position.x,
          position[0] - w / 2,
          6,
          delta
        );
      if (clicked !== null && index > clicked)
        ref.current.position.x = damp(
          ref.current.position.x,
          position[0] + w / 2,
          6,
          delta
        );
      if (clicked === null || clicked === index)
        ref.current.position.x = damp(
          ref.current.position.x,
          position[0],
          6,
          delta
        );
      ref.current.material.grayscale = damp(
        ref.current.material.grayscale,
        hovered || clicked === index ? 0 : Math.max(0, 1 - y),
        6,
        delta
      );
      ref.current.material.color.lerp(
        c.set(hovered || clicked === index ? "white" : "#aaa"),
        hovered ? 0.3 : 0.1
      );
    }
  });

  return (
    <Suspense fallback={<></>}>
      <Image_
        ref={ref}
        url={url}
        position={position}
        scale={scale as any}
        onClick={click}
        onPointerOver={over}
        onPointerOut={out}
      />
    </Suspense>
  );
};

const Items: FC<{
  clicked: number | null;
  isDarkMode: boolean;
  setClicked: (index: number | null) => void;
  setOffset: (offset: number) => void;
  ownedTokens: IOwnedToken[];
  start: number;
  end: number;
}> = ({
  clicked,
  isDarkMode,
  setOffset,
  setClicked,
  ownedTokens,
  start,
  end,
}) => {
  const { width, height } = useThree((state) => ({
    width: state.viewport.width,
    height: state.viewport.height,
  }));
  useFrame((state, delta) => {
    if (!state.scene) {
      return;
    }
    const background =
      state.scene.background === null
        ? new THREE.Color(isDarkMode ? "#fff" : "#000")
        : (state.scene.background as THREE.Color);

    const level = damp(background.r, isDarkMode ? 0 : 1, 10, delta);
    background.r = level;
    background.g = level;
    background.b = level;
    state.scene.background = background;
  });
  const urls = useMemo(
    () => ownedTokens.map(({ resizedImage }) => `${resizedImage}?h=256`),
    [ownedTokens]
  );
  const w = 4 - Math.max(3600 - width) / 2000;
  const gap = w / 64;

  const xW = w + gap;
  return (
    <ScrollControls
      horizontal
      distance={0.25}
      damping={10}
      pages={(width - xW + urls.length * xW) / width}
    >
      <Minimap ownedTokens={ownedTokens} isDarkMode={isDarkMode} />
      <Scroll>
        <ItemsScrollContainer
          setOffset={setOffset}
          start={start}
          end={end}
          ownedTokens={ownedTokens}
        >
          {urls.slice(start, end).map((url, i) => (
            <Item
              key={url}
              setClicked={setClicked}
              clicked={clicked}
              index={i + start}
              ownedTokens={ownedTokens}
              position={[(i + start) * xW + (1 / 4) * xW, 0, 0]}
              scale={[w, 4, 1]}
              selectedScale={[w * 2, 4 * 1.25, 1]}
              url={url}
              w={2 * w - 2 * gap}
            />
          ))}
        </ItemsScrollContainer>
      </Scroll>
    </ScrollControls>
  );
};

export const Carousel: FC<{
  nfts: INfts[] | undefined;
}> = ({ nfts: data }) => {
  const [clicked, setClicked] = useState<null | number>(null);
  const [offset, setOffset] = useState(0);

  const isDarkMode = useAppSelector(appbarSelectors.darkMode);
  const ownedTokens = useMemo(
    () =>
      data
        ? shuffle(
            data.reduce((memo, curr) => {
              return memo.concat(curr.ownedTokens);
            }, [] as IOwnedToken[])
          )
        : [],
    [data]
  );

  return (
    <ThreeCanvas
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      onPointerMissed={() => setClicked(null)}
    >
      <Items
        isDarkMode={isDarkMode}
        ownedTokens={ownedTokens}
        clicked={clicked}
        setClicked={setClicked}
        start={offset}
        end={offset + PRELOAD_AMOUNT}
        setOffset={setOffset}
      />
    </ThreeCanvas>
  );
};
