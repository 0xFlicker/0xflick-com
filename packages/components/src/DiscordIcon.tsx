import { FC } from "react";
import Image from "next/image";
import { useTheme } from "@0xflick/feature-theme";

export const DiscordIcon: FC = () => {
  const isDarkMode = useTheme();
  return (
    <Image
      src={`/marketing/discord-${isDarkMode ? "dark" : "light"}.png`}
      alt="discord"
      height={32}
      layout="fixed"
    />
  );
};
