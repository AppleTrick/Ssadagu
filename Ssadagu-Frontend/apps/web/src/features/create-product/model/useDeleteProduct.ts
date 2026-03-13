import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProduct } from '@/entities/product';
import { useAuthStore } from '@/shared/auth/useAuthStore';

export const useDeleteProduct = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      deleteProduct(productId, accessToken ?? undefined),
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
