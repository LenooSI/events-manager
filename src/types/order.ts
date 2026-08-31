export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
    id: number;
    giftId: number;
    guestName: string;
    guestEmail: string;
    message: string | null;
    amount: number;
    status: OrderStatus;
    paymentId: string | null;
    createdAt: Date;
    paidAt: Date | null;
}