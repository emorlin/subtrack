interface CategoryRow {
  id: string
  name: string
  color_hex: string
  amount: number
}

interface CategoryBreakdownProps {
  rows: CategoryRow[]
}

export default function CategoryBreakdown({ rows }: CategoryBreakdownProps) {
  const max = Math.max(...rows.map((r) => r.amount), 1)

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-2.5">
          {/* Color dot */}
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: row.color_hex }}
          />

          {/* Name */}
          <span className="text-[12px] text-[#374151] w-24 truncate shrink-0">
            {row.name}
          </span>

          {/* Bar (mobile only) */}
          <div className="md:hidden flex-1 h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(row.amount / max) * 100}%`,
                backgroundColor: row.color_hex,
              }}
            />
          </div>

          {/* Amount */}
          <span className="text-[12px] font-medium text-[#111827] ml-auto whitespace-nowrap">
            {Math.round(row.amount).toLocaleString('sv-SE')} kr
          </span>
        </div>
      ))}
    </div>
  )
}
