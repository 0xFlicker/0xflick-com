import { useAppDispatch, useAppSelector } from "app/store";
import { useAuth } from "features/auth/hooks/useAuth";
import { useWeb3 } from "features/web3";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
} from "react";
import { useCreateSlug } from "../graphql/useCreateSlug";
import { useDeactivateSlug } from "../graphql/useDeactivateSlug";
import { useEnroll } from "../graphql/useEnroll";
import { useSlugs } from "../graphql/useSlugs";
import {
  selectors as affiliateSelectors,
  actions as affiliateActions,
} from "../redux";

const EMPTY_SLUGS: string[] = [];
function useAffiliateContext() {
  const { isAuthenticated, signIn, signOut } = useAuth();
  const { selectedAddress } = useWeb3();
  const dispatch = useAppDispatch();
  const appIsAffiliate = useAppSelector(affiliateSelectors.isAffiliate);
  const appSlugs = useAppSelector(affiliateSelectors.slugs);
  const { createSlug, slugs: createdSlugs } = useCreateSlug();
  const { deactivateSlug, slugs: deactivatedSlugs } = useDeactivateSlug();
  const { enroll, roleName: createdRoleName } = useEnroll();
  const { slugs: fetchedSlugs, error: slugsError } = useSlugs({
    address: selectedAddress,
    skip: !isAuthenticated,
  });

  const slugs = isAuthenticated ? appSlugs : EMPTY_SLUGS;
  const isAffiliate = isAuthenticated ? appIsAffiliate : false;

  useEffect(() => {
    if (createdSlugs) {
      dispatch(affiliateActions.setAffiliateSlugs(createdSlugs));
      dispatch(affiliateActions.setIsAffiliate(true));
    }
  }, [createdSlugs, dispatch]);

  useEffect(() => {
    if (deactivatedSlugs) {
      dispatch(affiliateActions.setAffiliateSlugs(deactivatedSlugs));
      dispatch(affiliateActions.setIsAffiliate(true));
    }
  }, [deactivatedSlugs, dispatch]);

  useEffect(() => {
    if (fetchedSlugs && !slugsError) {
      dispatch(affiliateActions.setAffiliateSlugs(fetchedSlugs));
      dispatch(affiliateActions.setIsAffiliate(true));
    } else {
      dispatch(affiliateActions.setAffiliateSlugs([]));
      dispatch(affiliateActions.setIsAffiliate(false));
    }
  }, [dispatch, fetchedSlugs, slugsError]);

  useEffect(() => {
    if (createdRoleName) {
      dispatch(affiliateActions.setAffiliateSlugs([]));
      dispatch(affiliateActions.setIsAffiliate(true));
      signOut();
      signIn();
    }
  }, [createdRoleName, dispatch, signIn, signOut]);

  return {
    slugs,
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
