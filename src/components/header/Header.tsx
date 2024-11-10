"use client";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "@starknet-react/core";

import { usePathname, useRouter } from "next/navigation";
import ConnectWallet from "@components/ConnectWallet/page";
import Nav from "./Nav";

const Header = () => {
  const { account, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { push } = useRouter();
  const path = usePathname();

  const [isWalletOpen, setIsWalletOpen] = useState(false);
  function closeWalletModal() {
    setIsWalletOpen(false);
  }

  function openWalletModal() {
    setIsWalletOpen(true);
  }

  useEffect(() => {
    if (chain.network === "sepolia") {
      push("/");
    }
  }, [chain]);

  useEffect(() => {
    if (!isConnected && !account && path !== "/") {
      setIsWalletOpen(true);
    }
  }, [isConnected, account]);
  return (
    <>
      <header className="fixed z-[99] flex min-h-[4rem] w-screen items-center justify-between px-8 py-3 backdrop-blur lg:block">
        <Nav
          account={account}
          closeWalletModal={closeWalletModal}
          isWalletOpen={isWalletOpen}
          openWalletModal={openWalletModal}
        />
      </header>
      {!isConnected && !account && (
        <ConnectWallet
          isWalletOpen={isWalletOpen}
          closeWalletModal={closeWalletModal}
          openWalletModal={openWalletModal}
        />
      )}
    </>
  );
};

export default Header;