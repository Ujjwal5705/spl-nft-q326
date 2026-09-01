import {
  address,
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
  getTransferCheckedInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

//paste your mint address got from spl_init.ts
const mint = address("7mBgn5gQwTGmVLXg1vrDHAq2wZFr9tkddM1Cy5THKDjt");

//paste the address of the recipient
const to = address("9EUd4VNcjMAysd7zQk3Q1a4tb28BYndLNBAQDiYnHJ64");

(async () => {
  try {
    // 1. Load sender wallet
    const signer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });

    // 2. Find sender ATA
    const [fromAta] = await findAssociatedTokenPda({
      mint,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    console.log(`Your fromAta is: ${fromAta}`);

    // 3. Find recipient ATA
    const [toAta] = await findAssociatedTokenPda({
      mint,
      owner: to,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    console.log(`Recipient ATA is: ${toAta}`);

    // 4. Create recipient ATA
    const createAtaIx = await getCreateAssociatedTokenInstructionAsync({
      payer: signer,
      owner: to,
      mint,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    // 5. Transfer UJJ tokens
    const transferTx = getTransferCheckedInstruction({
      source: fromAta,
      mint,
      destination: toAta,
      authority: signer,
      amount: 1_000_000_000n,
      decimals: 9,
    });

    // 6. Get latest blockhash
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    // 7. Create transaction
    const msg = createTransactionMessage({
      version: 0,
    });

    const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);

    const msgWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      msgWithPayer,
    );

    // 8. Add instructions
    const txMessage = appendTransactionMessageInstructions(
      [createAtaIx, transferTx],
      msgWithLifetime,
    );

    // 9. Sign
    const signedTx = await signTransactionMessageWithSigners(txMessage);

    // 10. Assert blockhash lifetime
    assertIsTransactionWithBlockhashLifetime(signedTx);

    // 11. Get signature
    const signature = getSignatureFromTransaction(signedTx);

    // 12. Send and confirm
    await sendAndConfirm(signedTx, {
      commitment: "confirmed",
    });

    console.log(`Transfer TXID: ${signature}`);
    console.log(`From ATA: ${fromAta}`);
    console.log(`To ATA: ${toAta}`);
    console.log("Tokens transferred successfully!");
  } catch (error) {
    console.log(error);
  }
})();

// fromAta is: AiA6WKARbyHoTwLpgMgodgfQEDWW7KwFRQAsosvCrSgF
// Recipient ATA is: 6WymyGQ5CDChKLEK5ey7krmn3ggMp41KbLzKeGEpMiUv
// Transfer TXID: 4Ky4k2qoRdGZ7xnMwaBrmLeLze4V9HaXdkszNy2EtKh5aeASrcZtA6ktoR1hT63zcCcQBmAUbEM8scfP9NwWZmgw
// From ATA: AiA6WKARbyHoTwLpgMgodgfQEDWW7KwFRQAsosvCrSgF
// To ATA: 6WymyGQ5CDChKLEK5ey7krmn3ggMp41KbLzKeGEpMiUv
// Tokens transferred successfully!
