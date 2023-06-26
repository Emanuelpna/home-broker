import { MyWallet } from "@/components/MyWallet/MyWallet";

type HomePageProps = {
  params: { wallet_id: string };
};

export default async function HomePage({ params }: HomePageProps) {
  return (
    <main className="container mx-auto px-2">
      <h1 className="text-2xl font-bold">Meus Investimentos</h1>

      <MyWallet wallet_id={params.wallet_id} />
    </main>
  );
}
