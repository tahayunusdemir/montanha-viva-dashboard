import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { QRCode, RewardsData, DiscountCoupon } from "@/types/qr";
import { useAuthStore } from "@/store/authStore";

// =================================================================================
// TYPE DEFINITIONS
// =================================================================================
export interface QRCodeCreatePayload {
  name: string;
  text_content: string;
  points: number;
}

// =================================================================================
// ADMIN HOOKS
// =================================================================================

const QR_CODES_ENDPOINT = "/qr/qrcodes/";

// Fetch all QR codes
const fetchQRCodes = async (): Promise<QRCode[]> => {
  const { data } = await apiClient.get(QR_CODES_ENDPOINT);
  return data;
};

export const useQRCodes = () => {
  return useQuery<QRCode[], Error>({
    queryKey: ["qrCodes"],
    queryFn: fetchQRCodes,
  });
};

// Create a new QR code
const createQRCode = async (payload: QRCodeCreatePayload): Promise<QRCode> => {
  const { data } = await apiClient.post(QR_CODES_ENDPOINT, payload);
  return data;
};

export const useCreateQRCode = () => {
  const queryClient = useQueryClient();
  return useMutation<QRCode, Error, QRCodeCreatePayload>({
    mutationFn: createQRCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
    },
  });
};

// Delete a QR code
const deleteQRCode = async (id: number): Promise<void> => {
  await apiClient.delete(`${QR_CODES_ENDPOINT}${id}/`);
};

export const useDeleteQRCode = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteQRCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
    },
  });
};

// =================================================================================
// USER HOOKS
// =================================================================================

// Scan a QR code
interface ScanResponse {
  message: string;
  new_total_points: number;
}
const scanQRCode = async (textContent: string): Promise<ScanResponse> => {
  const { data } = await apiClient.post("/qr/scan/", {
    text_content: textContent,
  });
  return data;
};

export const useScanQRCode = () => {
  const { updateUserPoints } = useAuthStore.getState();

  return useMutation<ScanResponse, Error, string>({
    mutationFn: scanQRCode,
    onSuccess: (data) => {
      updateUserPoints(data.new_total_points);
    },
  });
};

// Fetch rewards data (points, scan history, coupons)
const fetchRewardsData = async (): Promise<RewardsData> => {
  const { data } = await apiClient.get("/qr/rewards/");
  return data;
};

export const useRewardsData = () => {
  return useQuery<RewardsData, Error>({
    queryKey: ["rewardsData"],
    queryFn: fetchRewardsData,
  });
};

// Generate a new discount coupon
const generateCoupon = async (): Promise<DiscountCoupon> => {
  const { data } = await apiClient.post("/qr/generate-coupon/");
  return data;
};

export const useGenerateCoupon = () => {
  const queryClient = useQueryClient();
  const { updateUserPoints } = useAuthStore.getState();

  return useMutation<DiscountCoupon, Error, void>({
    mutationFn: generateCoupon,
    onSuccess: () => {
      // Refresh rewards data to get the new coupon and updated points
      // For a more accurate update, we refetch and then update.
      queryClient.refetchQueries({ queryKey: ["rewardsData"] }).then(() => {
        const updatedData = queryClient.getQueryData<RewardsData>([
          "rewardsData",
        ]);
        if (updatedData) {
          updateUserPoints(updatedData.points);
        }
      });
    },
  });
};
