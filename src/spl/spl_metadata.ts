import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

//paste your mint address got from spl_init.ts
const mint = publicKey("7mBgn5gQwTGmVLXg1vrDHAq2wZFr9tkddM1Cy5THKDjt");

const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };

    // Token metadata
    const data: DataV2Args = {
      name: "Ujjwal Coin",
      symbol: "UJJ",
      uri: "https://gateway.irys.xyz/43Wi354zPKTy87nuMxCF7q8f785nmUawkoa38gJcHBJe",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };

    // Instruction arguments
    const args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    };

    // Create metadata account
    const tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });

    // Send transaction
    const result = await tx.sendAndConfirm(umi);

    console.log("signature:", bs58.encode(Buffer.from(result.signature)));
    console.log("Mint:", mint);
    console.log("Metadata created successfully!");

  } catch (error) {
    console.log("error", error);
  }
})();

// signature: ajQaKLDJKygXKTRWxiEeGLGLK5PFNgsVwGPtk59FA4P7LKKX1xsm7RR6un3SgyFVppQXrP5H1mWBzJ6z9x52NN9
// Mint: 7mBgn5gQwTGmVLXg1vrDHAq2wZFr9tkddM1Cy5THKDjt