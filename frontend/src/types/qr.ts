export interface QRCode {
  id: number;
  name: string;
  text_content: string;
  points: number;
  qr_image: string; // URL to the image
  created_at: string;
}

export interface UserScannedQR {
  id: number;
  qr_code: QRCode;
  scanned_at: string;
}

export interface DiscountCoupon {
  id: number;
  code: string;
  points_spent: number;
  created_at: string;
  expires_at: string;
  is_used: boolean;
}

export interface RewardsData {
  points: number;
  scan_history: UserScannedQR[];
  coupon_history: DiscountCoupon[];
} 