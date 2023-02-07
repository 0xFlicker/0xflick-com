import { FC } from "react";

/**
 * Consists of a preset set of rules for calculating and executing Hunnys Seasons airdrops
 * The way Hunny's Seasons airdrops work is that there are two contracts that we look at for owners.
 * The first contract is the "Hunnys10K" contract for which there are the following tiers: 1, 3, 6, and 12  tokens.
 * The second contract is the "HunnysOG" contract, for which we only care if you own one or not.
 *
 * A mapping is created that lists the tokenIds that will be airdrop for each tier.
 *
 * Lastly, using that mapping we have the Hunnys Seasons contract, which is used to perform the airdrop.
 *
 * One last wrinkle is that the contract we are reading owners from is on Ethereum but we are performing the airdrop on Polygon.
 */

// Ethereum
const Hunnys10KContractAddress = "0x5dfeb75abae11b138a16583e03a2be17740eaded";
const HunnysOGContractAddress = "0x64bd44df5590cfe4f0395b05fa0e6f096734bb77";
// Polygon
const HunnysSeasonsContractAddress =
  "0x43668e306dba9172824524fd2c0c6924e710ea5b";
