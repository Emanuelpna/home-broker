import { PropsWithChildren, startTransition } from "react";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";

import { revalidateOrders } from "@/infra/actions/revalidate-orders";

type SyncOrdersProps = {
  wallet_id: string;
};

export function SyncOrders({
  children,
  wallet_id,
}: PropsWithChildren<SyncOrdersProps>) {
  const { data, error } = useSWRSubscription(
    `${process.env.NEXT_PUBLIC_API_URL}/wallets/${wallet_id}/orders/events`,
    (path: string | URL, { next }: SWRSubscriptionOptions) => {
      const eventSource = new EventSource(path);

      eventSource.addEventListener("order-created", async (event) => {
        console.log(event);
        const orderCreated = JSON.parse(event.data);
        next(null, orderCreated);

        startTransition(() => {
          revalidateOrders(wallet_id);
        });
      });

      eventSource.addEventListener("order-updated", async (event) => {
        console.log(event);
        const orderUpdated = JSON.parse(event.data);
        next(null, orderUpdated);

        startTransition(() => {
          revalidateOrders(wallet_id);
        });
      });

      eventSource.onerror = (event) => {
        console.log("error:", event);
        eventSource.close();
        //@ts-ignore
        next(event.data, null);
      };

      return () => {
        console.log("close event source");
        eventSource.close();
      };
    }
  );

  return <>{children}</>;
}
