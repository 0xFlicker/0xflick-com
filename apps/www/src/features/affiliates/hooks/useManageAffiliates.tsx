import { useAppDispatch, useAppSelector } from "@0xflick/app-store";
import { useAuth } from "@0xflick/feature-auth/src/hooks/useAuth";
import { useWeb3 } from "@0xflick/feature-web3";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCreateSlug } from "../graphql/useCreateSlug";
import { useDeactivateSlug } from "../graphql/useDeactivateSlug";
import { useEnroll } from "../graphql/useEnroll";
import { useSlugs } from "../graphql/useSlugs";

const EMPTY_SLUGS: string[] = [];
function useAffiliateContext() {
  const { isAuthenticated, signIn, signOut } = useAuth();
  const { selectedAddress } = useWeb3();
  const [appSlugs, setAffiliateSlugs] = useState(EMPTY_SLUGS);
  const [appIsAffiliate, setAppIsAffiliate] = useState(false);

  const { createSlug, slugs: createdSlugs } = useCreateSlug();
  const { deactivateSlug, slugs: deactivatedSlugs } = useDeactivateSlug();
  const { enroll, roleName: createdRoleName } = useEnroll();
  const {
    slugs: fetchedSlugs,
    error: slugsError,
    count: fetchedCount,
  } = useSlugs({
    address: selectedAddress,
    skip: !isAuthenticated,
  });

  const slugs = isAuthenticated ? appSlugs : EMPTY_SLUGS;
  const isAffiliate = isAuthenticated ? appIsAffiliate : false;
  const count = isAuthenticated ? fetchedCount : 0;

  useEffect(() => {
    if (createdSlugs) {
      setAffiliateSlugs(createdSlugs);
      setAppIsAffiliate(true);
    }
  }, [createdSlugs]);

  useEffect(() => {
    if (deactivatedSlugs) {
      setAffiliateSlugs(deactivatedSlugs);
      setAppIsAffiliate(true);
    }
  }, [deactivatedSlugs]);

  useEffect(() => {
    if (fetchedSlugs && !slugsError) {
      setAffiliateSlugs(fetchedSlugs);
      setAppIsAffiliate(true);
    } else {
      setAffiliateSlugs([]);
      setAppIsAffiliate(false);
    }
  }, [fetchedSlugs, slugsError]);

  useEffect(() => {
    if (createdRoleName) {
      setAffiliateSlugs([]);
      setAppIsAffiliate(true);
      signOut();
      signIn();
    }
  }, [createdRoleName, signIn, signOut]);

  return {
    slugs,
    count,
    isAffiliate,
    createSlug,
    deactivateSlug,
    enroll,
    createdRoleName,
  };
}

type TContext = ReturnType<typeof useAffiliateContext>;
const AffiliateProvider = createContext<TContext | null>(null);

export const Provider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const context = useAffiliateContext();

  return (
    <AffiliateProvider.Provider value={context}>
      {children}
    </AffiliateProvider.Provider>
  );
};

export function useManageAffiliates() {
  const ctx = useContext(AffiliateProvider);
  if (ctx === null) {
    throw new Error("No context defined");
  }

  return ctx;
}
