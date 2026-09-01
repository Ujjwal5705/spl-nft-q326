import {
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import wallet from "../../devnet-wallet.json";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstructionAsync,
  getMintToInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

const amount = 100_000_000_000n;

//paste your mint address got from spl_init.ts
const mint = address("7mBgn5gQwTGmVLXg1vrDHAq2wZFr9tkddM1Cy5THKDjt");

(async () => {
  try {
    // 1. Load your wallet
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

    console.log("Wallet:", signer.address);

    // 2. Find your Associated Token Account (ATA)
    const [ata] = await findAssociatedTokenPda({
      mint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    console.log(`Your ATA is: ${ata}`);

    // 3. Create ATA instruction
    const createAtaIx = await getCreateAssociatedTokenInstructionAsync({
      payer: signer,
      owner: signer.address,
      mint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    // 4. Mint tokens into the ATA
    const mintToIx = getMintToInstruction({
      mint,
      token: ata,
      mintAuthority: signer,
      amount: amount,
    });

    // 5. Get latest blockhash
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    // 6. Create transaction message
    const msg = createTransactionMessage({ version: 0 });

    // 7. Set fee payer
    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);

    // 8. Set transaction lifetime
    const msgWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      msgWithPayer,
    );

    // 9. Add both instructions
    const txMessage = appendTransactionMessageInstructions(
      [createAtaIx, mintToIx],
      msgWithLifetime,
    );

    // 10. Sign transaction
    const signedTx = await signTransactionMessageWithSigners(txMessage);

    // 11. Tell TypeScript this is blockhash-based
    assertIsTransactionWithBlockhashLifetime(signedTx);

    // 12. Get transaction signature
    const signature = getSignatureFromTransaction(signedTx);

    // 13. Send and confirm
    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    await sendAndConfirm(signedTx, {
      commitment: "confirmed",
    });

    console.log(`Mint TXID: ${signature}`);
    console.log(`ATA: ${ata}`);
    console.log("Tokens minted successfully!");
  } catch (error) {
    console.log(error);
  }
})();

// Wallet: 98haFWC34iDWRP8chimBfDqEh6ggge79YXYPYF1Q3bMW
// Your ATA is: AiA6WKARbyHoTwLpgMgodgfQEDWW7KwFRQAsosvCrSgF
// Mint TXID: 5fF86Vc62rpYTH1gsRSmDtKmEKEec7K5aCs6QVz5AGEagdcdLaEsDeAMuukk3T1ohhce7zYnY11Gp4C5vz6F8ZfT
// ATA: AiA6WKARbyHoTwLpgMgodgfQEDWW7KwFRQAsosvCrSgF