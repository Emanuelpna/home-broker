import { Asset } from "./assets";

export type Order = {
  id: string;
  wallet_id: string;
  asset_id: string;
  shares: string;
  partial: string;
  price: string;
  type: "BUY" | "SELL";
  created_at: string;
  updated_at: string;
  status: "PENDING" | "OPEN" | "CLOSED" | "FAILED";
  Asset: Pick<Asset, "id" | "symbol">;
};
