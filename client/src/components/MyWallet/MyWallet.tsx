"use client";

import useSWR from "swr";
import Link from "next/link";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";

import { Asset, WalletAsset } from "@/domain/models/assets";

import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableHeadCell,
  TableRow,
} from "@/components/flowbite-components";

import { fetcher } from "@/utils";

type MyWalletProps = {
  wallet_id: string;
};

export function MyWallet({ wallet_id }: MyWalletProps) {
  const {
    data: walletAssets,
    error,
    mutate: mutateWalletAssets,
  } = useSWR<WalletAsset[]>(`/api/wallets/${wallet_id}/assets`, fetcher, {
    fallbackData: [],
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useSWRSubscription(
    `${process.env.NEXT_PUBLIC_API_URL}/assets/events`,
    (path, { next }: SWRSubscriptionOptions) => {
      const eventSource = new EventSource(path);
      eventSource.addEventListener("asset-price-changed", async (event) => {
        console.log(event);
        const assetChanged: Asset = JSON.parse(event.data);
        await mutateWalletAssets((prev) => {
          const foundIndex = prev!.findIndex(
            (walletAsset) => walletAsset.asset_id === assetChanged.id
          );

          if (foundIndex !== -1) {
            prev![foundIndex].Asset.price = assetChanged.price;
          }
          console.log(prev);
          return [...prev!];
        }, false);
        next(null, assetChanged);
      });

      eventSource.onerror = (event) => {
        console.error(event);
        eventSource.close();
      };
      return () => {
        eventSource.close();
      };
    },
    {}
  );

  useSWRSubscription(
    `${process.env.NEXT_PUBLIC_API_URL}/wallets/${wallet_id}/assets/events`,
    (path: string | URL, { next }: SWRSubscriptionOptions) => {
      const eventSource = new EventSource(path);

      eventSource.addEventListener("wallet-asset-updated", async (event) => {
        const walletAssetUpdated: WalletAsset = JSON.parse(event.data);

        await mutateWalletAssets((prev) => {
          const foundIndex =
            prev?.findIndex(
              (walletAsset) =>
                walletAsset.asset_id === walletAssetUpdated.asset_id
            ) ?? -1;

          if (prev && foundIndex >= 0) {
            prev[foundIndex].shares = walletAssetUpdated.shares;
          }

          return [...prev!];
        }, false);

        next(null, walletAssetUpdated);
      });

      eventSource.onerror = (error) => {
        console.error(error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    }
  );

  return (
    <Table>
      <TableHead>
        <TableHeadCell>Nome</TableHeadCell>
        <TableHeadCell>Preço R$</TableHeadCell>
        <TableHeadCell>Quantidade</TableHeadCell>
        <TableHeadCell>
          <span className="sr-only">Comprar/Vender</span>
        </TableHeadCell>
      </TableHead>

      <TableBody className="divide-y">
        {walletAssets!.map((walletAsset) => (
          <TableRow
            key={walletAsset.id}
            className="border-gray-700 bg-gray-800"
          >
            <TableCell className="whitespace-nowrap font-medium text-white">
              {walletAsset.Asset.id} ({walletAsset.Asset.symbol})
            </TableCell>
            <TableCell>R$ {walletAsset.Asset.price}</TableCell>
            <TableCell>{walletAsset.shares}</TableCell>
            <TableCell>
              <Link
                className="font-medium hover:underline text-cyan-500"
                href={`/${wallet_id}/home-broker/${walletAsset.Asset.id}`}
              >
                Comprar/Vender
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
