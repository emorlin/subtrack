import { signInWithGoogle } from '../hooks/useAuth'
import { useDemoContext } from '../contexts/DemoContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { enterDemo } = useDemoContext()
  const navigate = useNavigate()

  async function handleGoogleLogin() {
    try {
      setLoading(true)
      setError(null)
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Något gick fel')
      setLoading(false)
    }
  }

  function handleDemo() {
    enterDemo()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-[24px] font-semibold text-[#111827] tracking-[-0.3px]">
            Subtrack
          </h1>
          <p className="text-[#6B7280] text-[13px] mt-1">
            Håll koll på dina abonnemang
          </p>
        </div>

        {error && (
          <p className="text-[#B91C1C] bg-[#FEF2F2] text-[12px] px-3 py-2 rounded-[6px] mb-4">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-[#E5E7EB] text-[#374151] rounded-[6px] px-4 py-2.5 text-[13px] font-medium hover:bg-[#F9FAFB] transition-all duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon />
          {loading ? 'Loggar in…' : 'Fortsätt med Google'}
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E5E7EB]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[11px] text-[#9CA3AF]">eller</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemo}
          className="w-full border border-[#1B4FD8] text-[#1B4FD8] rounded-[6px] px-4 py-2.5 text-[13px] font-medium hover:bg-[#EFF6FF] transition-all duration-150 ease-out"
        >
          Utforska demo
        </button>

        <p className="text-center text-[11px] text-[#9CA3AF] mt-4">
          Demo-data sparas inte och försvinner när du stänger fliken.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4" />
      <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" fill="#34A853" />
      <path d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" fill="#FBBC05" />
      <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" fill="#EA4335" />
    </svg>
  )
}
