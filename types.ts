
export interface ShopeeAccount {
  id: string;
  username: string; // Shopee Username (Fetched)
  cookie: string;
  note: string;    // Label from user
  expiry: string;
  level?: string;
  totalSales?: number;
  totalCommission?: number;
}

export interface LiveSession {
  id: string;
  username: string;
  sessionId: string;
  title: string;
  startTime: string;
  duration: string;
  clicks: number;
  addedToCart: number;
  orders: number;
  sales: number;
  status: 'ONLINE' | 'OFFLINE';
}

export interface AffiliateStats {
  totalOrders: number;
  totalSales: number;
  totalCommission: number;
  activeChannels: string;
}
