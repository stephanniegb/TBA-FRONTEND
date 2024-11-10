"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getNftToken,
  useDeployAccount,
  useGetTbaAddress,
  useUpgradeAccount,
} from "@hooks/index";
import { useParams } from "next/navigation";
import { useNetwork } from "@starknet-react/core";
import { RpcProvider } from "starknet";
import { AccountClassHashes } from "@utils/constants";
import Link from "next/link";
import { useTokenBoundSDK } from "@hooks/useTokenboundHookContext";
import { CopyButton } from "ui/CopyButton";
import { Button } from "ui/button";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { WalletToken } from "types";
import DeployArrow from "./ui/deploy-arrow";
import Loading from "./loading";
const Portfolio = dynamic(() => import("./components/Portfolio"), {
  ssr: false,
});

const url = process.env.NEXT_PUBLIC_EXPLORER;
const sepolia_url = process.env.NEXT_PUBLIC_TESTNET_EXPLORER;

function Assets() {
  const { tokenboundV2, tokenboundV3, activeVersion, setVersion, loading } =
    useTokenBoundSDK();
  const { chain } = useNetwork();

  const [v2Address, setV2Address] = useState<string>("");
  const [v3Address, setV3Address] = useState<string>("");

  const provider = new RpcProvider({
    nodeUrl: `https://starknet-${chain.network}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  });

  const params = useParams();

  let contractAddress = params.contractAddress as string;
  let tokenId = params.tokenId as string;

  const { data: nft } = useQuery({
    queryKey: [`${contractAddress}-${tokenId}`, { contractAddress, tokenId }],
    queryFn: () =>
      getNftToken({
        contractAddress,
        tokenId,
        chain,
      }),
  });
  const tokenData = nft?.data as WalletToken;

  useGetTbaAddress({
    contractAddress: contractAddress,
    SetVersionAddress: setV3Address,
    tokenboundClient: tokenboundV3,
    tokenId: tokenId,
  });

  useGetTbaAddress({
    contractAddress: contractAddress,
    SetVersionAddress: setV2Address,
    tokenboundClient: tokenboundV2,
    tokenId: tokenId,
  });

  const network = chain.network;
  const v2Implementation =
    AccountClassHashes.V2[network as keyof typeof AccountClassHashes.V2];
  const v3Implementation =
    AccountClassHashes.V3[network as keyof typeof AccountClassHashes.V3];

  const fetchClassHash = useCallback(async () => {
    let success = false;

    const checkV2Address = async () => {
      if (v2Address) {
        const tbaClassHashV2 = await provider.getClassHashAt(v2Address);
        if (tbaClassHashV2 === v2Implementation) {
          setVersion((prev) => ({
            v2: {
              address: v2Address,
              status: tbaClassHashV2 === v2Implementation,
            },
            v3: prev?.v3 || { address: "", status: false },
          }));
          return;
        }
        if (tbaClassHashV2 === v3Implementation) {
          setVersion((prev) => ({
            v2: prev?.v2 || { address: "", status: false },
            v3: {
              address: v2Address,
              status: true,
            },
          }));
          return;
        }
      }
    };
    const checkV3Address = async () => {
      if (v3Address) {
        const tbaClassHashV3 = await provider.getClassHashAt(v3Address);
        if (tbaClassHashV3 === v3Implementation) {
          setVersion((prev) => ({
            v2: prev?.v2 || { address: "", status: false },
            v3: {
              address: v2Address,
              status: true,
            },
          }));
        }
      }
    };

    if (v2Address || v3Address) {
      try {
        await checkV2Address();
        success = true;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(error);
        }
      }
      if (!success) {
        try {
          await checkV3Address();
        } catch (error) {
          if (process.env.NODE_ENV !== "production") {
            console.error(error);
          }
        }
      }
    }
  }, [v2Address, v3Address]);

  useEffect(() => {
    fetchClassHash();
  }, [fetchClassHash]);

  const { deployAccount, deploymentStatus } = useDeployAccount({
    contractAddress: contractAddress,
    tokenId: tokenId,
  });

  const { upgradeAccount, upgradeStatus } = useUpgradeAccount({
    chain: chain,
    contractAddress: v2Address,
    tokenboundClient: tokenboundV2,
  });

  console.log(activeVersion?.version);

  if (loading) {
    return <Loading />;
  }

  return (
    // <section className="container mx-auto min-h-screen px-4 pb-16 pt-32">
    //   <h2 className="mb-8 text-deep-blue"> Token Bound Account</h2>
    //   <div className="grid w-full grid-cols-[1fr] gap-8 md:grid-cols-2">
    //     <div className="w-full rounded-[8px]">
    //       {tokenData?.metadata?.image ? (
    //         <img
    //           className="!h-[480px] !w-[673px] rounded-[8px] object-cover"
    //           src={tokenData?.metadata?.image}
    //           width={673}
    //           height={480}
    //           alt="NFT Image"
    //         />
    //       ) : (
    //         <div
    //           aria-label="loader"
    //           className="h-full min-h-[500px] w-full animate-pulse rounded-[8px] bg-gray-50"
    //         ></div>
    //       )}
    //     </div>
    //     <div>
    //       <div className="flex h-fit flex-wrap items-center justify-between gap-4">
    //         <h3
    //           className={`${
    //             tokenData?.metadata?.name
    //               ? "max-w-[20rem] overflow-hidden text-ellipsis whitespace-nowrap text-deep-blue"
    //               : "h-[1.2rem] w-[10rem] animate-pulse rounded-full bg-gray-50"
    //           } `}
    //         >
    //           {tokenData?.metadata?.name || ""}
    //         </h3>

    //         <div className="flex gap-4">
    //           <div>
    //             <div className="flex items-center rounded-[6px] bg-gray-50 text-sm">
    //               <CopyButton
    //                 className="px-2 py-3 text-center"
    //                 textToCopy={
    //                   activeVersion?.address ? activeVersion.address : v3Address
    //                 }
    //               />
    //               {/* <Link
    //                 href={`${
    //                   chain.network === "mainnet"
    //                     ? url
    //                     : chain.network === "sepolia"
    //                       ? sepolia_url
    //                       : ""
    //                 }/contract/${activeVersion?.address}`}
    //                 target="__blank"
    //                 title="view on starkscan"
    //                 className="inline-flex h-full items-center rounded-r-[6px] border border-l-deep-blue px-2 py-3 text-lg transition-all hover:bg-deep-blue hover:text-white"
    //               >
    //                 <span>
    //                   <NewTbaIcon />
    //                 </span>
    //               </Link> */}
    //             </div>
    //           </div>
    //           <div>
    //             <>
    //               {activeVersion?.version === "undeployed" ? (
    // <Button
    //   disabled={
    //     deploymentStatus === "ongoing" ||
    //     deploymentStatus === "success"
    //   }
    //   onClick={deployAccount}
    //   className={`${deploymentStatus === "failed" && "!bg-red-500"} transition-all`}
    // >
    //   {deploymentStatus === "idle" ? (
    //     "Deploy Account"
    //   ) : deploymentStatus === "ongoing" ? (
    //     <Spinner size="20px" color="white" />
    //   ) : deploymentStatus === "failed" ? (
    //     "Failed"
    //   ) : (
    //     "TBA Deployed"
    //   )}
    // </Button>
    //               ) : activeVersion?.version === "V2" ? (
    // <Button
    //   disabled={
    //     upgradeStatus === "ongoing" ||
    //     upgradeStatus === "success"
    //   }
    //   className={`${upgradeStatus === "failed" && "!bg-red-500"}`}
    //   onClick={upgradeAccount}
    // >
    //   {upgradeStatus === "idle" ? (
    //     "Upgrade Account"
    //   ) : upgradeStatus === "ongoing" ? (
    //     <Spinner size="20px" color="white" />
    //   ) : upgradeStatus === "failed" ? (
    //     "Failed"
    //   ) : (
    //     "TBA Deployed"
    //   )}
    // </Button>
    //               ) : activeVersion?.version === "V3" ? (
    //                 <Button disabled>TBA Deployed</Button>
    //               ) : (
    //                 <div className="h-[2.8rem] w-[8rem] animate-pulse rounded-[8px] bg-gray-50"></div>
    //               )}
    //             </>
    //           </div>
    //         </div>
    //       </div>
    //       {tokenData?.metadata?.description ? (
    //         <p className="mt-[18px]">{tokenData?.metadata?.description}</p>
    //       ) : (
    //         <div aria-label="loading" className="mt-[18px] flex flex-col gap-4">
    //           <div className="h-[1.2rem] w-[75%] animate-pulse rounded-full bg-gray-50"></div>
    //           <div className="h-[1.2rem] w-[75%] animate-pulse rounded-full bg-gray-50"></div>
    //         </div>
    //       )}
    //       <Portfolio
    //         contractAddress={contractAddress}
    //         tbaAddress={activeVersion?.address || ""}
    //         tokenId={tokenId}
    //         deployed //should take tba deployed status
    //       />
    //     </div>
    //   </div>
    // </section>
    <section className="mx-auto min-h-screen max-w-[1125px] px-8 pb-16 pt-32">
      <div className="mx-auto w-full max-w-[23rem] md:max-w-[40rem] lg:grid lg:max-w-none lg:grid-cols-2">
        <div className="flex flex-col items-center gap-4 lg:items-start">
          <div className="h-[17.1rem] w-full overflow-clip rounded-[16px] md:h-[31.5rem] md:w-[31.5rem]">
            {tokenData?.metadata?.image ? (
              <img
                className="scale-110 rounded-[16px] object-cover"
                src={tokenData?.metadata?.image}
                width={673}
                height={480}
                alt="NFT Image"
              />
            ) : (
              <div
                aria-label="loader"
                className="h-full min-h-[500px] w-full animate-pulse rounded-[8px] bg-gray-50"
              ></div>
            )}
          </div>
          <div className="flex w-full justify-between gap-2 md:w-[31.5rem]">
            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl md:text-3xl">
              {tokenData?.metadata?.name || ""}
            </p>
            <CopyButton
              textToCopy={
                activeVersion?.address ? activeVersion.address : v3Address
              }
              className="flex h-[2.1rem] w-[9rem] items-center justify-between rounded-full bg-gray-100 px-4 py-2 shadow-inner lg:w-[10rem]"
              copyIcon
            />
            {/* <Link
              href={`${
                chain.network === "mainnet"
                  ? url
                  : chain.network === "sepolia"
                    ? sepolia_url
                    : ""
              }/contract/${deployedAddress}`}
              target="__blank"
              title="view on starkscan"
              className="inline-flex h-full items-center rounded-r-[6px] border border-l-deep-blue px-2 py-3 text-lg transition-all hover:bg-deep-blue hover:text-white"
            >
              <span>
                <NewTabIcon />
              </span>
            </Link> */}
          </div>
          <div className="relative flex w-full items-center gap-8 md:max-w-[31.5rem] lg:max-w-none">
            {activeVersion?.version === "undeployed" && (
              <Button
                disabled={
                  deploymentStatus === "pending" ||
                  deploymentStatus === "success"
                }
                isLoading={deploymentStatus === "pending"}
                onClick={deployAccount}
                className={`w-fit rounded-full transition-all duration-300 ${deploymentStatus === "error" ? "text-error" : "bg-black text-white disabled:bg-gray-100 disabled:text-black"}`}
              >
                {deploymentStatus === "error" ? (
                  <span>Failed to deploy</span>
                ) : (
                  <span>Deploy Account</span>
                )}
              </Button>
            )}
            {activeVersion?.version === "V2" && (
              <Button
                disabled={
                  upgradeStatus === "pending" || upgradeStatus === "success"
                }
                className={`w-fit rounded-full transition-all duration-300 ${upgradeStatus === "error" ? "text-error" : "bg-black text-white disabled:bg-gray-100 disabled:text-black"}`}
                onClick={upgradeAccount}
                isLoading={upgradeStatus === "pending"}
              >
                {upgradeStatus === "error" ? (
                  <span>Failed to upgrade account</span>
                ) : (
                  <span>Upgrade Account</span>
                )}
              </Button>
            )}

            {activeVersion?.version === "V3" && (
              <Button
                asChild
                className="w-fit rounded-full bg-gray-100 text-foreground-primary"
              >
                <span>TBA Deployed</span>
              </Button>
            )}

            {activeVersion?.version === "undeployed" && <DeployArrow />}
          </div>
        </div>
        <div className="mx-auto mt-4 w-full md:max-w-[31.5rem] lg:mt-0 lg:max-w-none">
          <div className="flex w-full flex-col gap-4">
            <p className="text-xl">Description</p>
            {tokenData?.metadata?.description && (
              <p className="line-clamp-2 first-letter:capitalize">
                {tokenData?.metadata?.description}
              </p>
            )}
          </div>

          <Portfolio
            contractAddress={contractAddress}
            tbaAddress={
              activeVersion?.address ? activeVersion.address : v3Address
            }
            tokenId={tokenId}
            deployed={activeVersion?.version !== "undeployed"}
          />
        </div>
      </div>
    </section>
  );
}

export default Assets;
// "use client";
// import { useEffect, useState } from "react";
// import {
//   useTokenBoundSDK,
//   useGetAccountAddress,
//   getNftToken,
// } from "@hooks/index";
// import { useParams } from "next/navigation";
// import { useNetwork } from "@starknet-react/core";
// import dynamic from "next/dynamic";
// import { NewTabIcon } from "@public/icons";
// import Link from "next/link";
// import { WalletToken } from "../../../../types";
// import { useQuery } from "@tanstack/react-query";
// import { CopyButton } from "ui/copy-button";
// import { Button } from "ui/button";
// import DeployArrow from "./ui/deploy-arrow";
// import Loading from "./loading";
// const Portfolio = dynamic(() => import("./components/Portfolio"), {
//   ssr: false,
// });

// const url = process.env.NEXT_PUBLIC_EXPLORER;
// const sepolia_url = process.env.NEXT_PUBLIC_TESTNET_EXPLORER;

// function Assets() {
//   const params = useParams();

//   let contractAddress = params.contractAddress as string;
//   let tokenId = params.tokenId as string;

//   const { deployedAddress } = useGetAccountAddress({
//     contractAddress,
//     tokenId,
//   });

//   const { tokenbound } = useTokenBoundSDK();
//   const { chain } = useNetwork();

//   const [status, setStatus] = useState<boolean | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const getAccountStatus = async () => {
//       if (tokenbound) {
//         try {
//           const accountStatus = await tokenbound?.checkAccountDeployment({
//             tokenContract: contractAddress,
//             tokenId,
//           });
//           setStatus(accountStatus?.deployed || null);
//         } catch (error) {
//           console.error(error);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     getAccountStatus();
//   }, [tokenbound]);

//   const { data: nft } = useQuery({
//     queryKey: [`${contractAddress}-${tokenId}`, { contractAddress, tokenId }],
//     queryFn: () =>
//       getNftToken({
//         contractAddress,
//         tokenId,
//         chain,
//       }),
//   });
//   const tokenData = nft?.data as WalletToken;

//   const deployAccount = async () => {
//     try {
//       await tokenbound?.createAccount({
//         tokenContract: contractAddress,
//         tokenId: tokenId,
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   };

// if (loading) {
//   return <Loading />;
// }
//   return (
// <section className="mx-auto min-h-screen max-w-[1125px] px-8 pb-16 pt-32">
//   <div className="mx-auto w-full max-w-[23rem] md:max-w-[40rem] lg:grid lg:max-w-none lg:grid-cols-2">
//     <div className="flex flex-col items-center gap-4 lg:items-start">
//       <div className="h-[17.1rem] w-full overflow-clip rounded-[16px] md:h-[31.5rem] md:w-[31.5rem]">
//         {tokenData?.metadata?.image ? (
//           <img
//             className="scale-110 rounded-[16px] object-cover"
//             src={tokenData?.metadata?.image}
//             width={673}
//             height={480}
//             alt="NFT Image"
//           />
//         ) : (
//           <div
//             aria-label="loader"
//             className="h-full min-h-[500px] w-full animate-pulse rounded-[8px] bg-gray-50"
//           ></div>
//         )}
//       </div>
//       <div className="flex w-full justify-between gap-2 md:w-[31.5rem]">
//         <p className="overflow-hidden text-ellipsis whitespace-nowrap text-2xl md:text-3xl">
//           {tokenData?.metadata?.name || ""}
//         </p>
//         <CopyButton
//           textToCopy={deployedAddress}
//           className="flex h-[2.1rem] w-[9rem] items-center justify-between rounded-full bg-gray-100 px-4 py-2 shadow-inner lg:w-[10rem]"
//           copyIcon
//         />
//         {/* <Link
//           href={`${
//             chain.network === "mainnet"
//               ? url
//               : chain.network === "sepolia"
//                 ? sepolia_url
//                 : ""
//           }/contract/${deployedAddress}`}
//           target="__blank"
//           title="view on starkscan"
//           className="inline-flex h-full items-center rounded-r-[6px] border border-l-deep-blue px-2 py-3 text-lg transition-all hover:bg-deep-blue hover:text-white"
//         >
//           <span>
//             <NewTabIcon />
//           </span>
//         </Link> */}
//       </div>
//       <div className="relative flex w-full items-center gap-8 md:max-w-[31.5rem] lg:max-w-none">
//         {status ? (
// <Button
//   asChild
//   className="w-fit rounded-full bg-gray-100 text-foreground-primary"
// >
//   <span>TBA Deployed</span>
// </Button>
//         ) : (
//           <Button className="w-fit rounded-full" onClick={deployAccount}>
//             Deploy Account
//           </Button>
//         )}
//         {!status && <DeployArrow />}
//       </div>
//     </div>
//     <div className="mx-auto mt-4 w-full md:max-w-[31.5rem] lg:mt-0 lg:max-w-none">
//       <div className="flex w-full flex-col gap-4">
//         <p className="text-xl">Description</p>
//         {tokenData?.metadata?.description && (
//           <p className="line-clamp-2 first-letter:capitalize">
//             {tokenData?.metadata?.description}
//           </p>
//         )}
//       </div>

//       <Portfolio
//         contractAddress={contractAddress}
//         tbaAddress={deployedAddress}
//         tokenId={tokenId}
//         deployed={status}
//       />
//     </div>
//   </div>
// </section>
//   );
// }

// export default Assets;
