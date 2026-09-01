import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";

import wallet from "../../devnet-wallet.json";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

import { readFile } from "fs/promises";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));

const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const metadataFile = await readFile("updated_metadata.json", "utf8");

    const metadata = JSON.parse(metadataFile);

    const myUri = await umi.uploader.uploadJson(metadata);

    console.log("Updated metadata URI:", myUri);
  } catch (error) {
    console.error("error:", error);
  }
})();

// Updated metadata URI: https://gateway.irys.xyz/2XgTKDBVEEoDwbKDZBUY68JUCkgFGFd5ZwsqgDvim7cx