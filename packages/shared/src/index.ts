import { z } from "zod";

export const SaleStatus = {
  UPCOMING: "upcoming",
  ACTIVE: "active",
  ENDED: "ended",
} as const;

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

export const PurchaseResultCode = {
  SUCCESS: "SUCCESS",
  ALREADY_PURCHASED: "ALREADY_PURCHASED",
  SOLD_OUT: "SOLD_OUT",
  SALE_NOT_ACTIVE: "SALE_NOT_ACTIVE",
} as const;

export type PurchaseResultCode = (typeof PurchaseResultCode)[keyof typeof PurchaseResultCode];

export const purchaseRequestSchema = z.object({
  userId: z.string().min(1).max(255),
});

export type PurchaseRequest = z.infer<typeof purchaseRequestSchema>;

export const purchaseUserIdParamSchema = z.object({
  userId: z.string(),
});

export const saleStatusResponseSchema = z.object({
  status: z.enum([SaleStatus.UPCOMING, SaleStatus.ACTIVE, SaleStatus.ENDED]),
  stockRemaining: z.number().int(),
  totalStock: z.number().int(),
  startTime: z.string(),
  endTime: z.string(),
});

export type SaleStatusResponse = z.infer<typeof saleStatusResponseSchema>;

export const purchaseResponseSchema = z.object({
  success: z.boolean(),
  code: z.nativeEnum(PurchaseResultCode),
  message: z.string(),
});

export type PurchaseResponse = z.infer<typeof purchaseResponseSchema>;

export const purchaseErrorResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
});

export const purchaseStatusResponseSchema = z.object({
  userId: z.string(),
  hasPurchased: z.boolean(),
});

export type PurchaseStatusResponse = z.infer<typeof purchaseStatusResponseSchema>;

export const OrderEventType = {
  CREATE_ORDER: "CREATE_ORDER",
} as const;

export type OrderEventType = (typeof OrderEventType)[keyof typeof OrderEventType];

export const orderJobSchema = z.object({
  event_type: z.nativeEnum(OrderEventType),
  userId: z.string(),
});

export type OrderJob = z.infer<typeof orderJobSchema>;
