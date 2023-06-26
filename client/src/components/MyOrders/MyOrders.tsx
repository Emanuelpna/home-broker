import { Order } from "@/domain/models/orders";

import { isHomeBrokerClosed } from "@/utils";

import {
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableHeadCell,
  TableRow,
  Badge,
} from "@/components/flowbite-components";

async function getOrders(wallet_id: string): Promise<Order[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/wallets/${wallet_id}/orders`,
    {
      next: {
        tags: [`orders-wallet-${wallet_id}`],
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

export async function MyOrders({ wallet_id }: MyWalletProps) {
  const walletAssets = await getOrders(wallet_id);

  return (
    <section>
      <h2 className="text-xl font-bold">Minha ordens</h2>

      <Table className="mt-2">
        <TableHead>
          <TableHeadCell>asset_id</TableHeadCell>
          <TableHeadCell>quant.</TableHeadCell>
          <TableHeadCell>price</TableHeadCell>
          <TableHeadCell>tipo</TableHeadCell>
          <TableHeadCell>status</TableHeadCell>
        </TableHead>
        <TableBody>
          {walletAssets.map((order, key) => (
            <TableRow className=" border-gray-700 bg-gray-800" key={key}>
              <TableCell className="whitespace-nowrap font-medium text-white">
                {order.Asset.id}
              </TableCell>
              <TableCell>{order.shares}</TableCell>
              <TableCell>{order.price}</TableCell>
              <TableCell>
                <Badge>{order.type}</Badge>
              </TableCell>
              <TableCell>
                <Badge>{order.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
