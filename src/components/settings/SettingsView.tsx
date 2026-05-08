import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import {
  useCategories,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories'
import { useAuth, signOut } from '../../hooks/useAuth'
import { useDemoContext } from '../../contexts/DemoContext'
import type { Category } from '../../types'

const PRESET_COLORS = [
  '#7C3AED',
  '#1B4FD8',
  '#059669',
  '#16A34A',
  '#D97706',
  '#EA580C',
  '#DC2626',
  '#BE185D',
  '#0891B2',
  '#6B7280',
]

// ─── Profile ─────────────────────────────────────────────────────────────────

function ProfileCard() {
  const { user } = useAuth()
  const { isDemoMode, exitDemo } = useDemoContext()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const name = isDemoMode ? 'Alex Svensson' : (user?.user_metadata?.full_name ?? user?.email ?? '—')
  const email = isDemoMode ? 'demo@subtrack.app' : (user?.email ?? '')
  const avatarUrl = isDemoMode ? null : (user?.user_metadata?.avatar_url as string | undefined)
  const initial = name.charAt(0).toUpperCase()
  const avatarBg = isDemoMode ? 'bg-[#E0E7FF]' : 'bg-[#EFF6FF]'
  const avatarText = isDemoMode ? 'text-[#4338CA]' : 'text-[#1B4FD8]'

  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 flex items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-11 h-11 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className={`w-11 h-11 rounded-full ${avatarBg} flex items-center justify-center shrink-0`}>
          <span className={`text-[17px] font-semibold ${avatarText}`}>{initial}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[#111827] truncate">{name}</p>
        <p className="text-[12px] text-[#6B7280] truncate">{email}</p>
      </div>
      {isDemoMode ? (
        <button
          onClick={exitDemo}
          className="bg-[#1B4FD8] text-white rounded-[6px] px-3 py-1.5 text-[12px] font-medium hover:bg-[#1a46c2] transition-all duration-150 ease-out shrink-0"
        >
          Logga in
        </button>
      ) : (
        <button
          onClick={handleSignOut}
          className="border border-[#E5E7EB] text-[#6B7280] rounded-[6px] px-3 py-1.5 text-[12px] hover:bg-[#F9FAFB] transition-all duration-150 ease-out shrink-0"
        >
          Logga ut
        </button>
      )}
    </div>
  )
}

// ─── Color swatches ──────────────────────────────────────────────────────────

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-5 h-5 rounded-full transition-all duration-150 ${
            value === c ? 'ring-2 ring-offset-1 ring-[#111827]' : 'hover:scale-110'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}

// ─── Category form (add / edit) ───────────────────────────────────────────────

function CategoryForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Category
  onSave: (name: string, color_hex: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color_hex ?? PRESET_COLORS[0])

  function submit() {
    if (name.trim()) onSave(name.trim(), color)
  }

  return (
    <div className="px-4 py-3 space-y-2.5 bg-[#F9FAFB]">
      <ColorPicker value={color} onChange={setColor} />
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kategorinamn"
          autoFocus
          className="flex-1 min-w-0 border border-[#D1D5DB] focus:border-[#1B4FD8] rounded-[6px] px-3 py-1.5 text-[16px] md:text-[13px] outline-none bg-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') onCancel()
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="bg-[#1B4FD8] text-white rounded-[6px] px-3 py-1.5 text-[13px] font-medium disabled:opacity-40 transition-all duration-150 ease-out hover:bg-[#1a46c2] shrink-0"
        >
          {initial ? 'Spara' : 'Lägg till'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[13px] text-[#6B7280] hover:text-[#374151] transition-colors shrink-0"
        >
          Avbryt
        </button>
      </div>
    </div>
  )
}

// ─── Category row ─────────────────────────────────────────────────────────────

function CategoryRow({
  cat,
  onEdit,
  onDelete,
}: {
  cat: Category
  onEdit: () => void
  onDelete: () => void
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: cat.color_hex }}
      />
      <span className="flex-1 text-[13px] text-[#111827]">{cat.name}</span>

      {confirming ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[12px] text-[#6B7280]">Ta bort?</span>
          <button
            onClick={onDelete}
            className="text-[12px] font-medium text-[#B91C1C] hover:underline"
          >
            Ja
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-[12px] text-[#6B7280] hover:underline"
          >
            Nej
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onEdit}
            className="text-[#9CA3AF] hover:text-[#374151] transition-colors"
            aria-label="Redigera"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="text-[#9CA3AF] hover:text-[#B91C1C] transition-colors"
            aria-label="Ta bort"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Category section ─────────────────────────────────────────────────────────

function CategoriesCard() {
  const { data: categories = [] } = useCategories()
  const addCategory = useAddCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  return (
    <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden">
      {categories.map((cat, i) => (
        <div key={cat.id}>
          {i > 0 && <div className="h-px bg-[#F3F4F6] mx-4" />}
          {editingId === cat.id ? (
            <CategoryForm
              initial={cat}
              onSave={(name, color_hex) => {
                updateCategory.mutate({ id: cat.id, name, color_hex })
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <CategoryRow
              cat={cat}
              onEdit={() => { setIsAdding(false); setEditingId(cat.id) }}
              onDelete={() => deleteCategory.mutate(cat.id)}
            />
          )}
        </div>
      ))}

      {/* Add form / button */}
      {categories.length > 0 && <div className="h-px bg-[#F3F4F6]" />}
      {isAdding ? (
        <CategoryForm
          onSave={(name, color_hex) => {
            addCategory.mutate({ name, color_hex })
            setIsAdding(false)
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => { setEditingId(null); setIsAdding(true) }}
          className="w-full px-4 py-3 text-left text-[13px] text-[#1B4FD8] font-medium hover:bg-[#EFF6FF] transition-colors duration-150"
        >
          + Lägg till kategori
        </button>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SettingsView() {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <section>
        <p className="text-[11px] font-medium text-[#9CA3AF] tracking-wider uppercase mb-3">
          Profil
        </p>
        <ProfileCard />
      </section>

      <section>
        <p className="text-[11px] font-medium text-[#9CA3AF] tracking-wider uppercase mb-3">
          Kategorier
        </p>
        <CategoriesCard />
      </section>
    </div>
  )
}

