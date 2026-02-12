import { fourthwallGet } from "./api";
import type { FWShop } from "./types";

export async function getShop(): Promise<FWShop> {
  return fourthwallGet<FWShop>("/shop");
}
