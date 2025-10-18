"use client";
import { useState, useEffect } from "react";
import { motion } from 'motion/react';
import { Plus, Zap } from 'lucide-react';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const counterABI = [
  {
    inputs: [],
    name: "number",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "newNumber", type: "uint256" }],
    name: "setNumber",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const COUNTER_ADDRESS = "0xA162023BD4267A5649025f616016a6Ea4f6B8044" as `0x${string}`;

export default function Home() {
  const { isConnected } = useAccount();
  const [numberInput, setNumberInput] = useState("");

  const { data: currentNumber, refetch } = useReadContract({
    address: COUNTER_ADDRESS,
    abi: counterABI,
    functionName: "number",
    query: {
      enabled: isConnected,
    },
  });

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const handleIncrement = () => {
    writeContract({
      address: COUNTER_ADDRESS,
      abi: counterABI,
      functionName: "increment",
    });
  };

  const handleSetNumber = () => {
    if (!numberInput) return;
    writeContract({
      address: COUNTER_ADDRESS,
      abi: counterABI,
      functionName: "setNumber",
      args: [BigInt(numberInput)],
    });
    setNumberInput("");
  };

  const isLoading = isPending || isConfirming;

  return (
    <div className="min-h-screen bg-black">
      {/* Gradient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Wallet Header */}
      <header className="relative z-20 p-6 flex justify-end">
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
            <span className="mx-2 text-2xl font-bold text-white relative -top-1">•</span>
            <EthBalance className="text-lg font-bold text-white" />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>


      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center px-6 py-12 min-h-[80vh]">
        {isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            {/* Counter Display */}
            <motion.div
              key={currentNumber?.toString()}
              initial={{ scale: 1.05, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center justify-center min-w-[280px] h-40 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl shadow-emerald-500/30 border border-white/20">
                <span className="text-white" style={{ fontSize: '5rem', fontWeight: '700' }}>
                  {currentNumber?.toString() ?? "0"}
                </span>
              </div>
            </motion.div>

            {/* Increment Button */}
            <div className="mb-6">
              <button
                onClick={handleIncrement}
                disabled={isLoading}
                className="w-full h-16 bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 hover:from-emerald-800 hover:via-teal-800 hover:to-cyan-800 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 border border-white/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg font-semibold"
                style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Plus className="w-6 h-6 mr-2" />
                    <span>Increment +1</span>
                  </>
                )}
              </button>
            </div>

            {/* Set Number Section */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <label htmlFor="set-number" className="block text-sm font-medium text-white">
                Définir un nombre personnalisé
              </label>
              <div className="flex gap-3">
                <input
                  id="set-number"
                  type="number"
                  placeholder="Entrez un nombre..."
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSetNumber()}
                  className="flex-1 h-14 bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm rounded-lg px-4 outline-none"
                />
                <button
                  onClick={handleSetNumber}
                  disabled={isLoading || !numberInput}
                  className="h-14 px-8 border border-emerald-500/50 bg-emerald-600/30 text-white hover:bg-emerald-600/50 hover:border-emerald-400 backdrop-blur-sm rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
                >
                  {isLoading ? "Processing..." : "Set Number"}
                </button>
              </div>
            </div>

            {/* Transaction Hash */}
            {hash && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center pt-4 mt-4 border-t border-white/10"
              >
                <p className="text-white/50 text-sm">Transaction Hash:</p>
                <p className="text-emerald-400 text-sm font-mono mt-1">
                  {hash}
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 mb-6 shadow-lg shadow-emerald-500/30">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Counter</h2>
            <p className="text-white/70 text-lg">
              Veuillez connecter votre wallet pour interagir avec le compteur
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
