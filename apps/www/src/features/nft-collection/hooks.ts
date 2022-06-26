import { usePrefetch } from "./api";

export function useFlicksCollection() {
  usePrefetch("getNftCollection");
}
