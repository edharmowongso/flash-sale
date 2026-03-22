export const PurchaseResult = {
  SUCCESS: "success",
  ALREADY_PURCHASED: "already_purchased",
  SOLD_OUT: "sold_out",
} as const;

export type PurchaseResult = (typeof PurchaseResult)[keyof typeof PurchaseResult];
