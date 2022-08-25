import { FC } from "react";
import { Container, Typography } from "@mui/material";

export const LitePaperMarkdown: FC = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h2" component="h2" gutterBottom>
        Nameflick Litepaper
      </Typography>
      <Typography gutterBottom>
        Nameflick is an innovative token that combines the interface of an NFT +
        ENS resolver
      </Typography>
      <Typography gutterBottom>
        NFTs (Non-Fungible Token) are non-divisible tokens that can be
        transferred on compatible blockchains. NFTs provide provable control of
        a specific token ID which can be used to establish ownership and gate
        access to services.{" "}
      </Typography>
      <Typography gutterBottom>
        ENS (Ethereum Naming Service) is a decentralized naming service that
        allows users to claim ownership on a <i>.eth</i>
        name that is registered on the Ethereum blockchain. The ENS{" "}
        <a
          href="https://docs.ens.domains/dapp-developer-guide/resolving-names"
          target="_blank"
          rel="noreferrer noopener"
        >
          documentation
        </a>{" "}
        define standards for resolving names and additional metadata associated
        with a registered name. Like domain names, ownership of <i>.eth</i> name
        also allows the owner to establish additional sub-domains of an
        registered name.
      </Typography>
      <Typography variant="h3" component="h3" gutterBottom>
        Problem statement
      </Typography>
      <Typography gutterBottom>
        ENS provides a{" "}
        <a
          href="https://app.ens.domains/"
          target="_blank"
          rel="noreferrer noopener"
        >
          public application
        </a>{" "}
        and a{" "}
        <a
          href="https://etherscan.io/address/0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41#code"
          target="_blank"
          rel="noreferrer noopener"
        >
          public resolver
        </a>{" "}
        that can be used to administer, set metadata and create sub-domains for
        an owned domain. These transactions are performed on-chain, require the
        ENS owner&apos;s signature and cost gas. Scaling out the usage of a
        single ENS domain name for organizations and communities creates
        significant friction and cost for the owner of the ENS. Nameflick
        attempts to be a replacement for the public resolver with an improved
        resolver that supports use cases appropriate for power users,
        communities, and organizations.
      </Typography>
      <Typography variant="h3" component="h3" gutterBottom>
        Features available at release
      </Typography>
      <ul>
        <li>Combination NFT + ENS resolver token (Nameflick)</li>
        <li>One Nameflick token manages one ENS</li>
        <li>Unlimited sub-domains</li>
        <li>
          All metadata supported by{" "}
          <a
            href="https://app.ens.domains/"
            target="_blank"
            rel="noreferrer noopener"
          >
            app.ens.domains
          </a>{" "}
        </li>
        <li>Instant, gasless, offchain updates</li>
        <li>
          Basic NFT community support ENS webhosting via user-provided IPFS
        </li>
      </ul>
      <Typography variant="h3" component="h3" gutterBottom>
        Roadmap features under development
      </Typography>
      <ul>
        <li>Improved support for L1 ENS resolutions</li>
        <li>Onboarding communities to share a single ENS </li>
        <li>Managed ENS webhosting</li>
      </ul>
    </Container>
  );
};
