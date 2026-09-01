import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fetchAsset, mplCore, update } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

import wallet from "../../devnet-wallet.json";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));

const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    // Your existing MPL Core NFT
    const assetAddress = publicKey(
      "8jVp6FxkRdYHJdSWXT1zN9bwAz9qT5QnT78hQHB2ouru",
    );

    // Fetch the full asset object
    const asset = await fetchAsset(umi, assetAddress);

    console.log("Current NFT name:", asset.name);
    console.log("Current metadata URI:", asset.uri);
    console.log("Current owner:", asset.owner);

    // New metadata URI uploaded to Irys
    const newMetadataUri =
      "https://gateway.irys.xyz/2XgTKDBVEEoDwbKDZBUY68JUCkgFGFd5ZwsqgDvim7cx";

    // Update the NFT
    const tx = await update(umi, {
      asset,
      name: "Ujjwal Updated NFT",
      uri: newMetadataUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log("NFT updated successfully!");
    console.log("Asset:", assetAddress);
    console.log("New name: Ujjwal Updated NFT");
    console.log("New metadata URI:", newMetadataUri);
    console.log("Signature:", signature);
  } catch (error) {
    console.log("error:", error);
  }
})();
