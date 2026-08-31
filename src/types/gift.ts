export type GiftStatus = "available" | "pending" | "purchased";

export interface Gift {
    id: number;
    name: string;
    weddingId: number;
    description: string;
    price: number;
    status: GiftStatus;
}
