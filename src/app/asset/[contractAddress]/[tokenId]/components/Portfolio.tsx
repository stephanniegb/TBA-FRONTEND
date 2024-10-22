"use client";
import Tooltip from "@components/utils/tooltip";
import useRefreshMetadata from "@hooks/index";
import { CoinsIcon, GemIcon } from "@public/icons/icon";
import { useState } from "react";
import Button from "ui/button";
import NonFungibleAsset from "./NonFungibleAsset";
import FungibleAsset from "./FungibleAsset";

const Portfolio = ({
  tbaAddress,
  contractAddress,
  tokenId,
}: {
  tbaAddress: string;
  contractAddress: string;
  tokenId: string;
}) => {
  const [isCollectible, setIsCollectible] = useState(true);
  const toggleContent = () => {
    setIsCollectible((prevIsCollectible) => !prevIsCollectible);
  };
  const { refreshMetadata, loading, success } = useRefreshMetadata(
    contractAddress,
    tokenId,
  );

  return (
    <div>
      <div className="mt-6 flex w-fit items-center gap-[12px] rounded-[8px] bg-[#EFEFEF] p-2">
        <Button
          variant={"ghost"}
          onClick={toggleContent}
          className={`${
            isCollectible
              ? "bg-[#0C0C4F] text-white"
              : "bg-[#F2F2F2] text-gray-400"
          } flex cursor-pointer items-center gap-x-1 rounded-[6px] transition-all duration-500`}
        >
          <span className="text-lg">
            <GemIcon />
          </span>
          Collectible
        </Button>
        <Button
          variant={"ghost"}
          onClick={toggleContent}
          className={`${
            !isCollectible
              ? "bg-[#0C0C4F] text-white"
              : "bg-[#F2F2F2] text-gray-400"
          } flex cursor-pointer items-center gap-x-1 rounded-[6px] transition-all duration-500`}
        >
          <span className="text-lg">
            <CoinsIcon />
          </span>
          Assets
        </Button>
        <Tooltip message="click to refresh asset if metadata does not display">
          <Button
            onClick={refreshMetadata}
            disabled={loading}
            variant={"ghost"}
            className={`${
              loading ? "bg-red-300" : ""
            } flex cursor-pointer items-center gap-x-1 rounded-[6px] bg-red-500 text-white transition-all duration-500`}
          >
            Refresh metadata
          </Button>
          {/* {success?.status == 200 && isVisible ? (
            <p className="absolute rounded-lg bg-blue-500 pl-1 pr-1 text-xs text-white transition duration-300 ease-in-out">
              {success?.data.result}
            </p>
          ) : (
            ""
          )} */}
        </Tooltip>
      </div>
      {isCollectible ? (
        <NonFungibleAsset tbaAddress={tbaAddress} />
      ) : (
        <FungibleAsset tbaAddress={tbaAddress} />
      )}
    </div>
  );
};

export default Portfolio;