const BACKGROUND_IMAGE = '/backgrounds/794125_14238-NPF7PL.svg'

export default function NightForestBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <img
        src={BACKGROUND_IMAGE}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_22%] brightness-[0.55] saturate-[0.8]"
        decoding="async"
        fetchPriority="low"
      />
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(15, 26, 36, 0.35) 0%, rgba(15, 26, 36, 0.55) 45%, rgba(15, 26, 36, 0.65) 100%)
          `,
        }}
      />
    </div>
  )
}
