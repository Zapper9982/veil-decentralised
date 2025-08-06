import { ethers } from "ethers";
import MedicalContract from "@/contracts/Medical.json";
import MedicalWithZKContract from "@/contracts/MedicalWithZK.json";
import ZKPrescriptionVerifierContract from "@/contracts/ZKPrescriptionVerifier.json";
import HealthTokenContract from "@/contracts/HealthToken.json";

const MEDICAL_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MEDICAL_CONTRACT_ADDRESS!;
const MEDICAL_ZK_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MEDICAL_ZK_CONTRACT_ADDRESS!;
const ZK_VERIFIER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ZK_VERIFIER_CONTRACT_ADDRESS!;
const HEALTHTOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_HEALTHTOKEN_CONTRACT_ADDRESS!;

export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to a public provider if no wallet is present
  return ethers.getDefaultProvider(process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545/");
};

export const getSigner = async () => {
  const provider = getProvider();
  if (provider instanceof ethers.BrowserProvider) {
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      return provider.getSigner();
    }
  }
  return null; // No signer available on the server or without a wallet
};

export const getMedicalContract = async () => {
  const signer = await getSigner();
  const provider = getProvider();
  const contractProvider = signer || provider;
  return new ethers.Contract(MEDICAL_CONTRACT_ADDRESS, MedicalContract.abi, contractProvider);
};

export const getMedicalWithZKContract = async () => {
  const signer = await getSigner();
  const provider = getProvider();
  const contractProvider = signer || provider;
  return new ethers.Contract(MEDICAL_ZK_CONTRACT_ADDRESS, MedicalWithZKContract.abi, contractProvider);
};

export const getZKVerifierContract = async () => {
  const signer = await getSigner();
  const provider = getProvider();
  const contractProvider = signer || provider;
  return new ethers.Contract(ZK_VERIFIER_CONTRACT_ADDRESS, ZKPrescriptionVerifierContract.abi, contractProvider);
};

export const getHealthTokenContract = async () => {
    const signer = await getSigner();
    const provider = getProvider();
    const contractProvider = signer || provider;
    return new ethers.Contract(HEALTHTOKEN_CONTRACT_ADDRESS, HealthTokenContract.abi, contractProvider);
};
