import {
  CSSProperties,
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import Image from "next/image";
import { Waypoint } from "react-waypoint";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// import { HeroBackground } from "./HeroBackground";
import { useSpring, animated, config } from "react-spring";
import { LinkCollection } from "@0xflick/components/src/LinkCollection";
import { useTheme } from "@0xflick/feature-theme";

const SlideFromSide: FC<
  PropsWithChildren<{
    right?: boolean;
    scrollY: number;
  }>
> = ({ children, right, scrollY }) => {
  const rotationLength = 90;
  const elRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<{
    inView: boolean;
    positionAtEnter: number;
    scrollYAtEnter: number;
    viewportHeight: number;
    viewportAtTopAtEnter: number;
    rotation: number;
    opacity: number;
    travelDirection: "up" | "down" | null;
  }>({
    inView: false,
    positionAtEnter: 0,
    scrollYAtEnter: 0,
    viewportAtTopAtEnter: 0,
    rotation: 0,
    opacity: 0,
    viewportHeight: 0,
    travelDirection: null,
  });
  useEffect(() => {
    if (state.inView) {
      if (elRef.current) {
        const starterRot = right ? -rotationLength / 2 : rotationLength / 2;
        const factor = right ? 1 : -1;
        let rotation = 0;
        // If the user is scrolling up then travelDirection is up and the rotation at enter is 90 degrees
        // If the user is scrolling down then travelDirection is down and the rotation at enter is -90 degrees
        // When enter the viewport then positionAtEnter === scrollYAtEnter. When they diverge by viewportHeight
        // then the total rotation is 180 degrees.
        const offset =
          (scrollY - state.viewportHeight + state.viewportAtTopAtEnter) /
          state.viewportHeight;

        // Opacity is 1 when offset = 0.5 and 0 when offset = 1 or 0
        const opacity = Math.max(0, 1 - Math.abs(offset - 0.5) * 2);
        if (state.travelDirection === "up") {
          rotation = starterRot + factor * offset * rotationLength;
        } else if (state.travelDirection === "down") {
          rotation = starterRot + factor * offset * rotationLength;
        }
        setState((state) => ({
          ...state,
          rotation,
          opacity,
        }));
      }
    }
  }, [
    right,
    scrollY,
    state.inView,
    state.scrollYAtEnter,
    state.travelDirection,
    state.viewportAtTopAtEnter,
    state.viewportHeight,
  ]);

  const sFactor = right ? "" : "-";

  const fadeTransition = useSpring({
    config: config.stiff,
    to: {
      opacity: state.opacity,
      transform: `rotate(${state.rotation}deg)`,
    },
  });
  return (
    <Waypoint
      onEnter={({
        currentPosition,
        previousPosition,
        waypointTop,
        viewportBottom,
        viewportTop,
      }) => {
        const clientHeight = (elRef.current?.clientHeight || 0) / 2;
        if (
          previousPosition === Waypoint.below &&
          currentPosition === Waypoint.inside
        ) {
          setState({
            inView: true,
            positionAtEnter: waypointTop,
            scrollYAtEnter: scrollY,
            viewportAtTopAtEnter: viewportTop,
            viewportHeight: viewportBottom - viewportTop,
            rotation: right ? -rotationLength / 2 : rotationLength / 2,
            travelDirection: "up",
            opacity: 0,
          });
        } else if (
          previousPosition === Waypoint.above &&
          currentPosition === Waypoint.inside
        ) {
          const startingPositionYTop = waypointTop + clientHeight / 2;
          const endpointPositionY = viewportBottom;
          setState({
            inView: true,
            positionAtEnter: waypointTop,
            scrollYAtEnter: scrollY,
            viewportAtTopAtEnter: viewportTop,
            viewportHeight: viewportBottom - viewportTop,
            rotation: right ? rotationLength / 2 : -rotationLength / 2,
            travelDirection: "down",
            opacity: 0,
          });
        }
      }}
      onLeave={({ currentPosition, previousPosition }) => {
        if (
          previousPosition === Waypoint.inside &&
          currentPosition === Waypoint.above
        ) {
          setState({
            ...state,
            inView: false,
            travelDirection: null,
          });
        } else if (
          previousPosition === Waypoint.inside &&
          currentPosition === Waypoint.below
        ) {
          setState({
            ...state,
            inView: false,
            travelDirection: null,
          });
        }
      }}
      bottomOffset="0%"
      topOffset="0%"
    >
      <animated.div
        ref={elRef}
        style={{
          ...fadeTransition,
          x: right ? "35%" : "-35%",
          transformOrigin: `${right ? "right" : "left"} center`,
          height: "100%",
        }}
      >
        {children}
      </animated.div>
    </Waypoint>
  );
};

export const Hero: FC = () => {
  // const ignoreScroll: UIEventHandler<HTMLDivElement> = useCallback((event) => {
  //   event.preventDefault();
  // }, []);
  // Center the hero text vertically and horizontally.
  const { isDarkMode } = useTheme();
  const parallaxStyleCenter: CSSProperties = useMemo(
    () => ({
      display: "flex",
      flexFlow: "column",
      justifyContent: "center",
    }),
    []
  );
  const parallax = useRef();

  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const container = document.querySelector(".parallax-ref");
    function handleScroll(event: Event) {
      if (parallax.current) {
        // This is internal to react-parallax. See https://github.com/pmndrs/react-spring/discussions/1333#discussioncomment-940107
        const __internalState = parallax.current as any;
        setScroll(__internalState.current);
      }
    }
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <>
      {/* <HeroBackground /> */}

      <Parallax ref={parallax} pages={4} className="parallax-ref">
        <ParallaxLayer
          offset={0}
          speed={0}
          factor={1}
          style={parallaxStyleCenter}
        >
          <Typography variant="h1" align="center">
            NameFlick
          </Typography>
          <Box sx={{ height: "1rem" }} />
          <Typography variant="h4" align="center">
            basic marketing homepage
          </Typography>
          <Box sx={{ height: "1rem" }} />
          <Typography variant="body1" align="center">
            (we pass the savings on to you)
          </Typography>
        </ParallaxLayer>
        <ParallaxLayer
          sticky={{ start: 1, end: 2 }}
          speed={0}
          factor={1}
          style={parallaxStyleCenter}
        >
          <Typography variant="h4" align="center">
            Super charge your ENS domain
          </Typography>
        </ParallaxLayer>
        <ParallaxLayer
          offset={1.5}
          speed={0}
          factor={1}
          style={parallaxStyleCenter}
        >
          <SlideFromSide scrollY={scroll}>
            <Image src="/images/network.png" alt="" layout="fill" />
          </SlideFromSide>
        </ParallaxLayer>
        <ParallaxLayer
          offset={1.5}
          speed={0}
          factor={1}
          style={parallaxStyleCenter}
        >
          <SlideFromSide right scrollY={scroll}>
            <Image
              src="/images/network.png"
              alt=""
              layout="fill"
              style={{
                transform: "scaleX(-1) scaleY(-1)",
              }}
            />
          </SlideFromSide>
        </ParallaxLayer>
        <ParallaxLayer offset={3} speed={0} factor={1}>
          <Container maxWidth="xl">
            <LinkCollection isDarkMode={isDarkMode} />
          </Container>
        </ParallaxLayer>
        {/* <ParallaxLayer sticky={{ start: 3, end: 4.4 }} speed={0} factor={1}>
          <Card
            style={{
              ...parallaxStyleCenter,
              backgroundColor: "#aaaaff",
            }}
            sx={{
              mx: "10%",
              my: "auto",
            }}
          >
            <Container>
              <Typography variant="h2" align="center">
                Features
              </Typography>
            </Container>
          </Card>
        </ParallaxLayer>

        <ParallaxLayer offset={3.4} speed={0} factor={1}>
          <Card
            style={{
              ...parallaxStyleCenter,
            }}
            sx={{
              mx: "10%",
              mt: "30%",
              mb: "auto",
            }}
          >
            <Container>
              <Typography variant="h4" align="center" sx={{ mt: 4 }}>
                Wrap any ENS domain
              </Typography>
              <Typography
                align="center"
                sx={{
                  my: 4,
                }}
              >
                Each nameflick wraps a single ENS domain
              </Typography>
            </Container>
          </Card>
        </ParallaxLayer>
        <ParallaxLayer offset={4.4} speed={0} factor={1}>
          <Card
            style={{
              ...parallaxStyleCenter,
            }}
            sx={{
              mx: "10%",
              mt: "30%",
              mb: "auto",
            }}
          >
            <Container>
              <Typography variant="h4" align="center" sx={{ mt: 4 }}>
                Instant gasless updates
              </Typography>
              <Typography
                align="center"
                sx={{
                  my: 4,
                }}
              >
                Update any sub-domain to any new address instantly and without
                spending gas
              </Typography>
            </Container>
          </Card>
        </ParallaxLayer>
        */}
      </Parallax>
    </>
  );
};
