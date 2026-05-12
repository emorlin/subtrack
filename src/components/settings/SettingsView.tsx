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
import { useTheme } from '../../hooks/useTheme'
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
  const avatarBg = isDemoMode ? 'bg-[var(--c-demo-avatar-bg)]' : 'bg-[var(--c-accent-subtle)]'
  const avatarText = isDemoMode ? 'text-[var(--c-demo-avatar-text)]' : 'text-[var(--c-accent)]'

  return (
    <div className="bg-[var(--c-bg-card)] rounded-[12px] border border-[var(--c-border)] p-4 flex items-center gap-4">
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
        <p className="text-[14px] font-semibold text-[var(--c-text-primary)] truncate">{name}</p>
        <p className="text-[12px] text-[var(--c-text-muted)] truncate">{email}</p>
      </div>
      {isDemoMode ? (
        <button
          onClick={exitDemo}
          className="bg-[var(--c-accent)] text-white rounded-[6px] px-3 py-1.5 text-[12px] font-medium hover:bg-[var(--c-accent-hover)] transition-all duration-150 ease-out shrink-0"
        >
          Logga in
        </button>
      ) : (
        <button
          onClick={handleSignOut}
          className="border border-[var(--c-border)] text-[var(--c-text-muted)] rounded-[6px] px-3 py-1.5 text-[12px] hover:bg-[var(--c-bg-app)] transition-all duration-150 ease-out shrink-0"
        >
          Logga ut
        </button>
      )}
    </div>
  )
}

// ─── Appearance ───────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="bg-[var(--c-bg-card)] rounded-[12px] border border-[var(--c-border)] p-4 flex items-center justify-between">
      <div>
        <p className="text-[13px] font-medium text-[var(--c-text-primary)]">Mörkt läge</p>
        <p className="text-[12px] text-[var(--c-text-muted)] mt-0.5">Anpassa appens utseende</p>
      </div>
      <button
        type="button"
        onClick={toggle}
        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
          isDark ? 'bg-[var(--c-accent)]' : 'bg-[var(--c-border-strong)]'
        }`}
        aria-label={isDark ? 'Stäng av mörkt läge' : 'Aktivera mörkt läge'}
        role="switch"
        aria-checked={isDark}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
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
            value === c ? 'ring-2 ring-offset-1 ring-[var(--c-text-primary)]' : 'hover:scale-110'
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
    <div className="px-4 py-3 space-y-2.5 bg-[var(--c-bg-app)]">
      <ColorPicker value={color} onChange={setColor} />
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kategorinamn"
          autoFocus
          className="flex-1 min-w-0 border border-[var(--c-border-strong)] focus:border-[var(--c-accent)] rounded-[6px] px-3 py-1.5 text-[16px] md:text-[13px] outline-none bg-[var(--c-bg-card)] text-[var(--c-text-primary)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') onCancel()
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="bg-[var(--c-accent)] text-white rounded-[6px] px-3 py-1.5 text-[13px] font-medium disabled:opacity-40 transition-all duration-150 ease-out hover:bg-[var(--c-accent-hover)] shrink-0"
        >
          {initial ? 'Spara' : 'Lägg till'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-[13px] text-[var(--c-text-muted)] hover:text-[var(--c-text-secondary)] transition-colors shrink-0"
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
      <span className="flex-1 text-[13px] text-[var(--c-text-primary)]">{cat.name}</span>

      {confirming ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[12px] text-[var(--c-text-muted)]">Ta bort?</span>
          <button
            onClick={onDelete}
            className="text-[12px] font-medium text-[var(--c-danger-text)] hover:underline"
          >
            Ja
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-[12px] text-[var(--c-text-muted)] hover:underline"
          >
            Nej
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onEdit}
            className="text-[var(--c-text-subtle)] hover:text-[var(--c-text-secondary)] transition-colors"
            aria-label="Redigera"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="text-[var(--c-text-subtle)] hover:text-[var(--c-danger-text)] transition-colors"
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
    <div className="bg-[var(--c-bg-card)] rounded-[12px] border border-[var(--c-border)] overflow-hidden">
      {categories.map((cat, i) => (
        <div key={cat.id}>
          {i > 0 && <div className="h-px bg-[var(--c-bg-subtle)] mx-4" />}
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
      {categories.length > 0 && <div className="h-px bg-[var(--c-bg-subtle)]" />}
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
          className="w-full px-4 py-3 text-left text-[13px] text-[var(--c-accent)] font-medium hover:bg-[var(--c-accent-subtle)] transition-colors duration-150"
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
      <div>
        <h1 className="text-[20px] font-semibold text-[var(--c-text-primary)] tracking-[-0.3px]">Inställningar</h1>
        <p className="text-[13px] text-[var(--c-text-muted)] mt-1 leading-relaxed">
          Hantera din profil, välj tema och anpassa dina kategorier.
        </p>
      </div>
      <section>
        <h2 className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase mb-3">
          Profil
        </h2>
        <ProfileCard />
      </section>

      <section>
        <h2 className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase mb-3">
          Utseende
        </h2>
        <ThemeToggle />
      </section>

      <section>
        <h2 className="text-[11px] font-medium text-[var(--c-text-subtle)] tracking-wider uppercase mb-3">
          Kategorier
        </h2>
        <CategoriesCard />
      </section>
    </div>
  )
}
