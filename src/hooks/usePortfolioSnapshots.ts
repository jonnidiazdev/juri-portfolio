import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPortfolioSnapshots, savePortfolioSnapshot } from '../services/portfolioSnapshots'
import type { PortfolioSnapshot, PortfolioSnapshotPayload } from '../types'

export function usePortfolioSnapshots(ownerId: string | null | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['portfolioSnapshots', ownerId],
    queryFn: () => getPortfolioSnapshots(ownerId!),
    enabled: !!ownerId,
  })

  const saveMutation = useMutation({
    mutationFn: (payload: PortfolioSnapshotPayload) => savePortfolioSnapshot(ownerId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolioSnapshots', ownerId] })
    },
  })

  return {
    snapshots: (query.data ?? []) as PortfolioSnapshot[],
    isLoading: query.isLoading,
    error: query.error,
    saveSnapshot: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
  }
}
