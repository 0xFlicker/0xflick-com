import { FC, useCallback, useState, MouseEvent, useMemo } from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Image from "next/image";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/CheckCircle";
import { useLocale } from "@0xflick/feature-locale";
import { IconButton, ListItem } from "@mui/material";
import { decorateChainImageUrl, TChain, useWeb3 } from "../hooks";
import { Chain, useNetwork, useSwitchNetwork } from "wagmi";

export const ConnectedDropDownModal: FC<{
  anchorEl: Element | null;
  chains: Chain[];
  handleClose: () => void;
  handleSwitch: (chain: Chain) => void;
  currentChain?: Chain;
  assetPrefix?: string;
}> = ({
  anchorEl,
  assetPrefix,
  handleClose,
  handleSwitch,
  chains,
  currentChain,
}) => {
  const { t } = useLocale("common");
  const open = Boolean(anchorEl);
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      onClose={handleClose}
      keepMounted
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box sx={{ width: 320 }}>
        <MenuList disablePadding>
          {chains.map((chain) => (
            <MenuItem key={chain.id} onClick={() => handleSwitch(chain)}>
              <ListItemIcon>
                {currentChain?.id === chain.id ? (
                  // large CheckIcon
                  <CheckIcon sx={{ fontSize: 40 }} />
                ) : (
                  <Image
                    src={`${assetPrefix ?? ""}${decorateChainImageUrl(chain)}`}
                    alt=""
                    width={40}
                    height={40}
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography textAlign="right">{chain.name}</Typography>
                }
              />
            </MenuItem>
          ))}
        </MenuList>
      </Box>
    </Menu>
  );
};
export const ChainSelector: FC<{
  assetPrefix?: string;
}> = ({ assetPrefix }) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);

  const { currentChain: chain } = useWeb3();

  const { chains, error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();
  const handleMenu = useCallback((event: MouseEvent) => {
    setMenuAnchorEl(event.currentTarget);
  }, []);
  const onMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);
  const handleSwitch = useCallback(
    (chain: Chain) => {
      onMenuClose();
      if (switchNetwork && chain?.id) {
        switchNetwork(chain.id);
      }
    },
    [onMenuClose, switchNetwork]
  );
  return chain && chains?.length ? (
    <>
      <IconButton onClick={handleMenu} size="small">
        <Image
          src={`${assetPrefix ?? ""}${decorateChainImageUrl(chain)}`}
          alt=""
          width={40}
          height={40}
        />
        {isLoading && (
          <CircularProgress
            variant="indeterminate"
            sx={{
              width: 40,
              height: 40,
              position: "absolute",
            }}
          />
        )}
      </IconButton>
      <ConnectedDropDownModal
        anchorEl={menuAnchorEl as any}
        assetPrefix={assetPrefix}
        handleClose={onMenuClose}
        handleSwitch={handleSwitch}
        chains={chains}
        currentChain={chain}
      />
    </>
  ) : null;
};
