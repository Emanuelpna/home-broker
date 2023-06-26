import Link from "next/link";

import { WalletAsset } from "@/domain/models/assets";

import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableHeadCell,
  TableRow,
} from "@/components/flowbite-components";

async function getWalletAssets(wallet_id: string): Promise<WalletAsset[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/wallets/${wallet_id}/assets`,
    {
      next: {
        revalidate: 1,
        // revalidate: isHomeBrokerClosed() ? 60 * 60 : 5,
      },
    }
  );

  return response.json();
}

type MyWalletProps = {
  wallet_id: string;
};

export async function MyWallet({ wallet_id }: MyWalletProps) {
  const walletAssets = await getWalletAssets(wallet_id);

  return (
    <ul>
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
          {walletAssets.map((walletAsset) => (
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
    </ul>
  );
}
