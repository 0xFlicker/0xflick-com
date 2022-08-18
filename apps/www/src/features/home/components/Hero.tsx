import {
  CSSProperties,
  FC,
  PropsWithChildren,
  UIEventHandler,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Parallax, ParallaxLayer } from "@react-spring/parallax";
import Image from "next/image";
import { Waypoint } from "react-waypoint";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  Container,
  Typography,
} from "@mui/material";
import { HeroBackground } from "./HeroBackground";
import { useSpring, animated, config } from "react-spring";

const SlideFromSide: FC<
  PropsWithChildren<{
    right?: boolean;
  }>
> = ({ children, right }) => {
  const [inView, setInview] = useState(false);
  const sFactor = right ? "" : "-";
  const transition = useSpring({
    config: config.gentle,
    to: {
      x: !inView ? `${sFactor}100%` : `${sFactor}50%`,
      opacity: !inView ? 0 : 1,
    },
  });
  return (
    <Waypoint
      onEnter={() => setInview(true)}
      onLeave={() => setInview(false)}
      topOffset="20%"
      bottomOffset="40%"
    >
      <animated.div
        style={{
          ...transition,
          height: "100%",
        }}
      >
        {children}
      </animated.div>
    </Waypoint>
  );
};

const FAQ: FC = () => {
  return (
    <>
      <Card>
        <Accordion>
          <AccordionSummary>
            <Typography variant="h6">
              What is the purpose of this website?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              This website is a tool to help you find the best place to stay
              during your stay in the Netherlands.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography variant="h6">How do I use this website?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              You can use the search bar to find the best place to stay.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary>
            <Typography variant="h6">
              How do I add a place to the website?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              You can add a place to the website by filling out the form on the
              right.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Card>
    </>
  );
};

export const Hero: FC = () => {
  // const ignoreScroll: UIEventHandler<HTMLDivElement> = useCallback((event) => {
  //   event.preventDefault();
  // }, []);
  // Center the hero text vertically and horizontally.
  const parallaxStyleCenter: CSSProperties = useMemo(
    () => ({
      display: "flex",
      flexFlow: "column",
      justifyContent: "center",
    }),
    []
  );
  return (
    <>
      {/* <HeroBackground /> */}

      <Parallax pages={7}>
        <ParallaxLayer
          offset={0}
          speed={0}
          factor={1}
          style={parallaxStyleCenter}
        >
          <Typography variant="h2" align="center">
            NameFlick
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
          <SlideFromSide>
            <Image src="/network.png" alt="" layout="fill" />
          </SlideFromSide>
        </ParallaxLayer>
        <ParallaxLayer
          offset={1.5}
          speed={0}
          factor={1}
          style={parallaxStyleCenter}
        >
          <SlideFromSide right>
            {/* flip the image horizontally */}
            <Image
              src="/network.png"
              alt=""
              layout="fill"
              style={{
                transform: "scaleX(-1) scaleY(-1)",
              }}
            />
          </SlideFromSide>
        </ParallaxLayer>
        <ParallaxLayer sticky={{ start: 3, end: 4.9 }} speed={0} factor={1}>
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
        <ParallaxLayer offset={4} speed={0} factor={1}>
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
        <ParallaxLayer offset={4.6} speed={0} factor={1}>
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
                NFT token support
              </Typography>
              <Typography
                align="center"
                sx={{
                  my: 4,
                }}
              >
                Resolve any NFT token to its underlying address, for example
                <i> 1234.example-nft-collection.eth</i> resolves to the address
                holding the NFT token with id 1234
              </Typography>
            </Container>
          </Card>
        </ParallaxLayer>
        <ParallaxLayer offset={6}>
          <Container sx={{ mt: 8 }}>
            <FAQ />
          </Container>
        </ParallaxLayer>
      </Parallax>
    </>
  );
};
