import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct, UpdateProductRequest } from '@/entities/product';
import { useAuthStore } from '@/shared/auth/useAuthStore';

export const useUpdateProduct = (productId: number) => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductRequest) =>
      updateProduct(productId, data, accessToken ?? undefined),
    onSuccess: () => {
      // Invalidate both the list and the specific product detail
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
};
