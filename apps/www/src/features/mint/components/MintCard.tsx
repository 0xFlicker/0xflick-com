import {
  Typography,
  Card,
  CardActions,
  CardContent,
  Button,
} from "@mui/material";
import { useAppSelector } from "app/store";
import { useHasPermission } from "features/auth/hooks";
import { canPreSaleMint } from "features/auth/matchers";
import { selectors as web3Selectors } from "features/web3";
import { useLocale } from "locales/hooks";
import { FC, useCallback, useState } from "react";
import { useTotalSupply, useMaxSupply, useBalanceOf } from "../hooks";
import { ApprovalCloseReason, ApprovalCard } from "./ApprovalCard";
import { MintPreSaleCloseReason, MintPreSaleModal } from "./MintPreSaleModal";

export const MintCard: FC = () => {
  const [mintOpen, setMintOpen] = useState(false);
  const { t } = useLocale(["mint"]);

  const address = useAppSelector(web3Selectors.address);
  const { isFetching: balanceOfFetching, balanceOf } = useBalanceOf(address);
  const {
    isFetching: isTotalSupplyFetching,
    totalSupply,
    refresh: refreshTotalSupply,
  } = useTotalSupply();
  const { isFetching: isMaxSupplyFetching, maxSupply } = useMaxSupply();

  const isFetching = isTotalSupplyFetching || isMaxSupplyFetching;
  const balanceOfValue = typeof balanceOf !== "undefined" ? balanceOf : 0;
  const totalSupplyValue = typeof totalSupply !== "undefined" ? totalSupply : 0;
  const maxSupplyValue = typeof maxSupply !== "undefined" ? maxSupply : 0;
  const openMintModal = useCallback(() => setMintOpen(true), [setMintOpen]);
  const closeMintModal = useCallback(
    (reason?: MintPreSaleCloseReason) => {
      setMintOpen(false);
      refreshTotalSupply();
    },
    [setMintOpen, refreshTotalSupply]
  );

  const canPreSale = useHasPermission(canPreSaleMint);
  return (
    <>
      <MintPreSaleModal open={mintOpen} handleClose={closeMintModal} />
      <Card>
        <CardContent>
          <Typography variant="h2" gutterBottom>
            {t("mint_card_title", {
              ns: "mint",
            })}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {canPreSale
              ? t("mint_card_description", {
                  ns: "mint",
                  balanceOf: balanceOfValue,
                })
              : t("mint_card_not_allowed_description")}
          </Typography>
          <Typography fontSize={16} color="text.secondary" component="p">
            {isFetching
              ? t("mint_card_supply_loading", { ns: "mint" })
              : t("mint_card_supply", {
                  ns: "mint",
                  totalSupply: totalSupplyValue,
                  maxSupply: maxSupplyValue,
                })}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={openMintModal}>
            {t("mint_now", {
              ns: "mint",
            })}
          </Button>
        </CardActions>
      </Card>
    </>
  );
};
