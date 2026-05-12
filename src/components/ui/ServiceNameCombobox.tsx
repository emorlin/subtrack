import { useState, useMemo } from 'react'
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react'
import { getDomainForService, SERVICE_SUGGESTIONS } from '../../lib/serviceIcons'

interface Props {
  value: string
  onChange: (value: string) => void
  hasError?: boolean
}

export default function ServiceNameCombobox({ value, onChange, hasError = false }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const startsWith = SERVICE_SUGGESTIONS.filter((s) => s.toLowerCase().startsWith(q))
    const contains = SERVICE_SUGGESTIONS.filter(
      (s) => !s.toLowerCase().startsWith(q) && s.toLowerCase().includes(q)
    )
    return [...startsWith, ...contains].slice(0, 8)
  }, [query])

  return (
    <Combobox
      immediate
      value={value}
      onChange={(selected: string | null) => {
        if (selected) {
          onChange(selected)
          setQuery('')
          setOpen(false)
        }
      }}
    >
      <div className="relative">
        <ComboboxInput
          autoComplete="off"
          placeholder="t.ex. Netflix"
          displayValue={() => value}
          onChange={(e) => {
            onChange(e.target.value)
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-invalid={hasError}
          className={`w-full min-w-0 border ${
            hasError ? 'border-[var(--c-danger-text)]' : 'border-[var(--c-border-strong)]'
          } focus:border-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-0 rounded-[6px] px-3 py-2 text-[16px] md:text-[13px] text-[var(--c-text-primary)] outline-none bg-[var(--c-bg-card)] transition-all duration-150 ease-out`}
        />

        {open && filtered.length > 0 && (
          <ComboboxOptions
            static
            className="absolute z-[200] mt-1 w-full bg-[var(--c-bg-card)] border border-[var(--c-border)] rounded-[8px] shadow-lg overflow-hidden"
          >
            {filtered.map((name) => (
              <ComboboxOption
                key={name}
                value={name}
                className={({ focus }) =>
                  `flex items-center gap-2.5 px-3 py-2 cursor-pointer select-none transition-colors duration-75 ${
                    focus
                      ? 'bg-[var(--c-accent-subtle)] text-[var(--c-accent)]'
                      : 'text-[var(--c-text-primary)]'
                  }`
                }
              >
                <SuggestionIcon name={name} />
                <span className="text-[13px]">{name}</span>
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  )
}

function SuggestionIcon({ name }: { name: string }) {
  const [failed, setFailed] = useState(false)
  const domain = getDomainForService(name)

  if (domain && !failed) {
    return (
      <img
        src={`https://favicon.im/${domain}?larger=true`}
        alt=""
        aria-hidden="true"
        onError={() => setFailed(true)}
        className="w-5 h-5 rounded-[4px] object-contain bg-white shrink-0"
      />
    )
  }

  return (
    <div className="w-5 h-5 rounded-[4px] bg-[var(--c-bg-subtle)] flex items-center justify-center text-[8px] font-medium text-[var(--c-text-muted)] shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}
