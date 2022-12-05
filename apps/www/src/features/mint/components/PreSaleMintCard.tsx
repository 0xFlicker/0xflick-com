import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Typography from "@mui/material/Typography";
import { useAppSelector } from "@0xflick/app-store";
import { useHasAllowedAction } from "features/auth/hooks";
import { canPreSaleMint } from "features/auth/matchers";
import { selectors as web3Selectors } from "@0xflick/feature-web3";
import { useLocale } from "@0xflick/feature-locale";
import { FC, useCallback, useState } from "react";
import {
  useTotalSupply,
  useMaxSupply,
  useBalanceOf,
  usePreSaleActive,
} from "../hooks";
import { MintPreSaleCloseReason, MintPreSaleModal } from "./MintPreSaleModal";

export const PreSaleMintCard: FC = () => {
  const [mintOpen, setMintOpen] = useState(false);
  const { t } = useLocale(["mint"]);

  const address = useAppSelector(web3Selectors.address);
  const { isFetching: isPresaleActiveFetching, preSaleActive } =
    usePreSaleActive();
  const { isFetching: balanceOfFetching, balanceOf } = useBalanceOf(address);
  const {
    isFetching: isTotalSupplyFetching,
    totalSupply,
    refresh: refreshTotalSupply,
  } = useTotalSupply();
  const { isFetching: isMaxSupplyFetching, maxSupply } = useMaxSupply();

  const isFetching =
    isTotalSupplyFetching || isMaxSupplyFetching || isPresaleActiveFetching;
  const balanceOfValue = typeof balanceOf !== "undefined" ? balanceOf : 0;
  const totalSupplyValue = typeof totalSupply !== "undefined" ? totalSupply : 0;
  const maxSupplyValue = typeof maxSupply !== "undefined" ? maxSupply : 0;
  const isPreSaleActive =
    typeof preSaleActive !== "undefined" ? preSaleActive : false;
  // const preSaleActiv
  const openMintModal = useCallback(() => setMintOpen(true), [setMintOpen]);
  const closeMintModal = useCallback(
    (reason?: MintPreSaleCloseReason) => {
      setMintOpen(false);
      refreshTotalSupply();
    },
    [setMintOpen, refreshTotalSupply]
  );

  const hasPreSaleRole = useHasAllowedAction(canPreSaleMint);
  let description = "";
  if (hasPreSaleRole && isPreSaleActive) {
    description = t("mint_card_description", {
      ns: "mint",
      balanceOf: balanceOfValue,
    });
  } else if (hasPreSaleRole && !isPreSaleActive) {
    description = t("mint_card_not_active_description", { ns: "mint" });
  } else if (!hasPreSaleRole) {
    description = t("mint_card_not_allowed_description", { ns: "mint" });
  }
  const canPreSale = hasPreSaleRole && isPreSaleActive;
  return (
    <>
      <MintPreSaleModal open={mintOpen} handleClose={closeMintModal} />
      <Card>
        <CardHeader
          title={t("presale_mint_card_title", {
            ns: "mint",
          })}
        />
        <CardContent>
          <Typography variant="body1" gutterBottom>
            {description}
          </Typography>
          {canPreSale && (
            <Typography fontSize={16} color="text.secondary" component="p">
              {isFetching
                ? t("mint_card_supply_loading", { ns: "mint" })
                : t("mint_card_supply", {
                    ns: "mint",
                    totalSupply: totalSupplyValue,
                    maxSupply: maxSupplyValue,
                  })}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          {canPreSale && (
            <Button size="small" onClick={openMintModal}>
              {t("mint_now", {
                ns: "mint",
              })}
            </Button>
          )}
        </CardActions>
      </Card>
    </>
  );
};
