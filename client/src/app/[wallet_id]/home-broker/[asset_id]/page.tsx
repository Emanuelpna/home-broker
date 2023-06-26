import { HiShoppingCart, HiArrowUp } from "@/components/react-icons-hi";
import { TabsGroup, TabsItem, Card } from "@/components/flowbite-components";

import { MyOrders } from "@/components/MyOrders/MyOrders";
import { OrderForm } from "@/components/OrderForm/OrderForm";
import { ChartComponent } from "@/components/charts/ChartComponent/ChartComponent";

type HomePageProps = {
  params: { wallet_id: string; asset_id: string };
};

export default async function HomeBrokerPage({ params }: HomePageProps) {
  return (
    <main className="container mx-auto px-2">
      <h1 className="text-2xl font-bold">Home Broker - {params.asset_id}</h1>

      <section className="grid grid-cols-5 flex-grow gap-2 mt-2">
        <div className="col-span-2 flex flex-col gap-2">
          <Card
            theme={{
              root: {
                children: "flex h-full flex-col justify-center gap-4 py-4 px-2",
              },
            }}
          >
            <TabsGroup aria-label="Default tabs" style="pills">
              <TabsItem active title="Comprar" icon={HiShoppingCart}>
                <OrderForm
                  wallet_id={params.wallet_id}
                  asset_id={params.asset_id}
                  type="BUY"
                />
              </TabsItem>
              <TabsItem title="Vender" icon={HiArrowUp}>
                <OrderForm
                  wallet_id={params.wallet_id}
                  asset_id={params.asset_id}
                  type="SELL"
                />
              </TabsItem>
            </TabsGroup>
          </Card>

          <Card
            className="w-full"
            theme={{
              root: {
                children: "flex h-full flex-col justify-center gap-4 py-4 px-2",
              },
            }}
          >
            <MyOrders wallet_id={params.wallet_id}></MyOrders>
          </Card>
        </div>

        <div className="col-span-3 flex flex-grow">
          <ChartComponent header="Asset 1 - R$ 100" />
        </div>
      </section>
    </main>
  );
}
