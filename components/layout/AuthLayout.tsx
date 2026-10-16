// Mise en page commune des pages d'authentification (connexion, inscription,
// mot de passe oublié, réinitialisation) : panneau navy de marque à gauche,
// formulaire à droite. Sur mobile, le panneau se réduit à un bandeau.

export const AUTH_INPUT = 'cs-input h-[46px] font-medium text-[14px]'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      <div className="relative overflow-hidden flex flex-col justify-between gap-10 px-5 py-6 lg:p-12 text-white" style={{ backgroundColor: 'var(--cs-navy)' }}>
        <div className="flex items-center gap-3 relative z-10">
          <img src="/logo-capsul.jpg" alt="" className="rounded-[7px] shrink-0" style={{ width: 36, height: 36, objectFit: 'cover' }} />
          <div>
            <div className="font-bold text-[13px] tracking-[0.06em]">CAPSUL</div>
            <div className="font-semibold text-[10px] tracking-[0.22em]" style={{ color: 'var(--cs-gold)' }}>STUDIO</div>
          </div>
        </div>

        <div className="hidden lg:block relative z-10">
          <h2 className="text-[30px] leading-[1.2] font-bold max-w-[16ch]" style={{ textWrap: 'balance' }}>
            L’analyse d’investissement en <span style={{ color: 'var(--cs-gold)' }}>quelques minutes</span>.
          </h2>
          <p className="mt-3.5 max-w-[40ch]" style={{ color: 'var(--cs-sky)' }}>
            Simulez, comparez les scénarios et générez la fiche commerciale du client sans repasser par Excel et Canva.
          </p>
        </div>

        <div className="hidden lg:flex gap-8 flex-wrap relative z-10 tabular-nums">
          <Stat value="200+" label="projets réalisés" />
          <Stat value="30 M€" label="investis" />
          <Stat value="7 %" label="de rendement moyen" />
        </div>

        {/* Cercles décoratifs */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute -right-[120px] -bottom-[120px] w-[380px] h-[380px] rounded-full"
          style={{
            border: '1px solid rgba(201,148,58,.22)',
            boxShadow: '0 0 0 60px rgba(201,148,58,.025), 0 0 0 120px rgba(201,148,58,.015)',
          }}
        />
      </div>

      <div className="flex items-center justify-center px-5 py-10 lg:py-12">
        <div className="w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <b className="block text-[22px] font-extrabold">{value}</b>
      <span className="text-[12px]" style={{ color: 'var(--cs-sky)' }}>{label}</span>
    </div>
  )
}
