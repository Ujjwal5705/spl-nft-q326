import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

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
    //change the image uri to your image uri obtained from nft_image.ts
    const image =
      "https://gateway.irys.xyz/AJJJDXoyGrFkEbNKve4vdNwkGNHqvwjqSuX8n5CGeR6o";

    //json scheme : https://www.metaplex.com/docs/smart-contracts/core/json-schema
    //change the metadata
    const metadata = {
      name: "Ujjwal NFT",
      description: "My first NFT minted using Metaplex Core on Solana Devnet.",
      image,
      attributes: [
        {
          trait_type: "Creator",
          value: "Ujjwal Sharma",
        },
        {
          trait_type: "Network",
          value: "Solana Devnet",
        },
      ],
    };

    const myUri = await umi.uploader.uploadJson(metadata);

    console.log(`metadata uri: ${myUri}`);
  } catch (error) {
    console.log("error", error);
  }
})();

// metadata uri: https://gateway.irys.xyz/9RNAAEN7WzeN8tyEdcmR4BEWVaAqnay471Mog3GkM8wU