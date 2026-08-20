export default function PizarraBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none chalk-texture"
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(ellipse 60% 40% at 15% 0%, rgba(107, 173, 201, 0.06), transparent 60%),
          radial-gradient(ellipse 50% 35% at 100% 100%, rgba(201, 162, 39, 0.05), transparent 60%),
          linear-gradient(180deg, #14150f 0%, #0e0f0a 55%, #0b0c08 100%)
        `,
      }}
    >
      {/* Marco de pizarra: veta sutil en los bordes, como el listón de madera del borde de una pizarra real */}
      <div className="absolute inset-0 border-[10px] sm:border-[14px] border-[#1f2013]/60" />
      <div className="absolute inset-3 sm:inset-4 border border-[#3f4132]/25 rounded-sm" />
    </div>
  )
}
