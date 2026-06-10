import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  console.log('User ID:', user.id)
  console.log('Profile:', profile)
  console.log('Profile error:', profileError)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl font-black text-[#16314E] tracking-tight mb-2">
          ⊕ CAPSUL <span className="text-[#e6b64c]">STUDIO</span>
        </div>
        <div className="text-xl text-gray-700 mt-4">
          Bonjour <strong>{profile?.full_name ?? user.email}</strong> 👋
        </div>
        <div className="text-sm text-gray-400 mt-1 capitalize">
          {profile?.role}
        </div>
      </div>
    </div>
  )
}