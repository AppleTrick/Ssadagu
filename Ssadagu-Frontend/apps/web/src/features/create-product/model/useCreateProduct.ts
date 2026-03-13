import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, CreateProductRequest } from '@/entities/product';
import { useAuthStore } from '@/shared/auth/useAuthStore';

export const useCreateProduct = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      createProduct(data, accessToken ?? undefined),
    onSuccess: () => {
      // Invalidate products list to show the new item
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
