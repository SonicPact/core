"use client";

import { FC, ReactNode } from "react";
import WalletContextProvider from "@/shared/context/WalletContextProvider";

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  return <WalletContextProvider>{children}</WalletContextProvider>;
};

export default Providers;
