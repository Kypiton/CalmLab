export interface Items {
	id: number;
	title: string;
	image: string;
	price: number;
	quantity: number;
}

export interface Order {
	stripeSessionId: string;
	customerEmail: string | null;
	total: number;
	status: "no_payment_required" | "paid" | "unpaid"
	createdAt: string;
	items: Items[];
}