import { Uploader } from "@irys/upload";
import { Solana } from "@irys/upload-solana";
import wallet from "../../devnet-wallet.json";

const getIrysUploader = async () => {
  const irys = await Uploader(Solana)
    .withWallet(new Uint8Array(wallet))
    .withRpc("https://api.devnet.solana.com")
    .devnet();

  return irys;
};

(async () => {
  try {
    const irys = await getIrysUploader();

    const tags = [
      {
        name: "Content-Type",
        value: "application/json",
      },
    ];

    const receipt = await irys.uploadFile("./metadata.json", {
      tags,
    });

    console.log("Upload successful!");
    console.log("Transaction ID:", receipt.id);
    console.log("Irys URL:", `https://gateway.irys.xyz/${receipt.id}`);
  } catch (error) {
    console.error("Upload failed:", error);
  }
})();

// Transaction ID: 43Wi354zPKTy87nuMxCF7q8f785nmUawkoa38gJcHBJe
// Irys URL: https://gateway.irys.xyz/43Wi354zPKTy87nuMxCF7q8f785nmUawkoa38gJcHBJe