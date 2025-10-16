// main.js

let proofHash = null;
let walletAddress = null;
let contract = null;

// Example contract placeholder — ganti nanti dengan address dan ABI
const CONTRACT_ADDRESS = "0xYourContractAddressHere";
const CONTRACT_ABI = [
  "function mintAlias(string memory aliasName, bytes32 proofHash) public"
];

// Step 1 — Generate proof hash (simulate zkTLS)
document.getElementById("verifyBtn").addEventListener("click", async () => {
  const name = document.getElementById("realName").value.trim();
  if (!name) return alert("Please enter a name first.");

  // Simulate zkTLS proof (hash of name)
  const encoder = new TextEncoder();
  const data = encoder.encode(name);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  proofHash = "0x" + hashHex;
  document.getElementById("proofResult").textContent =
    `✅ zkTLS Proof generated: ${proofHash.slice(0, 10)}...`;

  // Enable mint button
  document.getElementById("mintBtn").disabled = false;
});

// Step 2 — Connect wallet + mint alias
document.getElementById("mintBtn").addEventListener("click", async () => {
  const aliasName = document.getElementById("aliasName").value.trim();
  if (!aliasName) return alert("Please enter an alias name.");
  if (!proofHash) return alert("Please verify identity first.");

  if (!window.ethereum) return alert("Please install MetaMask.");

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    walletAddress = await signer.getAddress();

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.mintAlias(aliasName, proofHash);
    document.getElementById("walletStatus").textContent = "⏳ Minting alias on-chain...";
    await tx.wait();

    document.getElementById("walletStatus").textContent =
      `✅ Alias "${aliasName}" minted for ${walletAddress}`;
  } catch (err) {
    console.error(err);
    alert("Transaction failed or wallet not connected.");
  }
});