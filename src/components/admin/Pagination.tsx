'use client'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  isFetching?: boolean
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  isFetching,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from = Math.min((page - 1) * pageSize + 1, total)
  const to = Math.min(page * pageSize, total)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-500">
        Showing {from}–{to} of {total}{isFetching ? ' · Loading…' : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 text-xs border border-gray-200 hover:border-gray-400 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>

        {pages.map((p, idx) => (
          <>
            {idx > 0 && pages[idx - 1] !== p - 1 && (
              <span key={`gap-${p}`} className="px-1 text-xs text-gray-400">
                …
              </span>
            )}
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-7 text-xs rounded border transition-colors ${
                p === page
                  ? 'border-blush-500 bg-blush-500 text-white'
                  : 'border-gray-200 hover:border-gray-400 text-gray-600'
              }`}
            >
              {p}
            </button>
          </>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 text-xs border border-gray-200 hover:border-gray-400 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>
    </div>
  )
}
