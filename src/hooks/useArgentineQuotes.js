import { useQuery } from '@tanstack/react-query'
import { fetchArgentineQuote } from '../services/iol'
import { ASSET_TYPES, REFRESH_INTERVALS } from '../config/constants'

export function useArgentineQuotes(assets) {
  const argAssets = assets.filter(a => a.type !== ASSET_TYPES.CRYPTO)
  const symbols = argAssets.map(a => `${a.type}:${a.symbol}`).join('|')

  return useQuery({
    queryKey: ['argentineQuotes', symbols],
    queryFn: async () => {
      const results = {}
      for (const asset of argAssets) {
        try {
          const q = await fetchArgentineQuote(asset.type === 'accion' ? 'acciones' : asset.type, asset.symbol)
          // Normalizar precio última negociación
          const precio = q.ultimoPrecio ?? q.precioAjuste ?? q.precioPromedio ?? 0
          if(precio !== 0) {
            results[asset.id] = { raw: q, price: precio / q.lote }
          } else {
            results[asset.id] = { raw: q, price: 'N/A' }
          }
        } catch (e) {
          results[asset.id] = { error: e.message, price: 'N/A' }
        }
      }
      return results
    },
    staleTime: REFRESH_INTERVALS.slow,
    refetchInterval: REFRESH_INTERVALS.slow,
    enabled: argAssets.length > 0,
  })
}
