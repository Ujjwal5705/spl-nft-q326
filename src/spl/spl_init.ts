import {
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsTransactionMessageWithBlockhashLifetime,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import {
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";

//import your wallet
import wallet from "../../devnet-wallet.json";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

(async () => {
  // 1. Load your wallet
  const payer = await createKeyPairSignerFromBytes(new Uint8Array(wallet));

  console.log("Wallet:", payer.address);

  // 2. Generate a new keypair for the token mint
  const mint = await generateKeyPairSigner();

  console.log("Mint address:", mint.address);

  // 3. Get the size of a standard SPL mint account
  const mintSize = BigInt(getMintSize());

  // 4. Calculate the rent-exempt balance required
  const rentExemption = await rpc.getMinimumBalanceForRentExemption(mintSize).send();

  // 5. Create the mint account
  const createMintAccountInstruction = getCreateAccountInstruction({
    payer,
    newAccount: mint,
    lamports: rentExemption,
    space: mintSize,
    programAddress: TOKEN_PROGRAM_ADDRESS,
  });

  // 6. Initialize the mint
  const initializeMintInstruction = getInitializeMintInstruction({
    mint: mint.address,
    decimals: 9,
    mintAuthority: payer.address,
    freezeAuthority: payer.address,
  });

  // 7. Get a recent blockhash
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

  // 8. Build the transaction
  const transactionMessage = appendTransactionMessageInstructions(
    [createMintAccountInstruction, initializeMintInstruction],
    setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      setTransactionMessageFeePayerSigner(
        payer,
        createTransactionMessage({ version: 0 }),
      ),
    ),
  );

  // 9. Sign the transaction
  const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);

  // 10. Tell TypeScript this uses a blockhash lifetime
  assertIsTransactionWithBlockhashLifetime(signedTransaction);

  // 11. Send and confirm
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  await sendAndConfirmTransaction(signedTransaction, {
    commitment: "confirmed",
  });

  console.log("\n✅ SPL token mint created!");
  console.log("Mint Address:", mint.address);
  console.log(
    "Transaction Signature:",
    getSignatureFromTransaction(signedTransaction),
  );
  console.log(
    `Explorer: https://explorer.solana.com/tx/${getSignatureFromTransaction(signedTransaction)}?cluster=devnet`,
  );

  try {
  } catch (error) {
    console.error("❌ Error:", error);
  }
})();

// Mint Address: 7mBgn5gQwTGmVLXg1vrDHAq2wZFr9tkddM1Cy5THKDjt
// Transaction Signature: 2aUUEiXim7LKbCm6BniyyZUtXUB9MNUX8Mm6bmUWRzrxTBFAgEgsmDJ8a2M3HmMnKzqadw6bgxTf9NEvzExhSMSD
// Explorer: https://explorer.solana.com/tx/2aUUEiXim7LKbCm6BniyyZUtXUB9MNUX8Mm6bmUWRzrxTBFAgEgsmDJ8a2M3HmMnKzqadw6bgxTf9NEvzExhSMSD?cluster=devnet