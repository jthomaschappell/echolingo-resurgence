'use client'

export default function Header() {
  return (
    <header className="w-full bg-primary-orange px-4 py-3 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-golden-amber"
        >
          <path
            d="M8 2L6 4L8 6M16 2L18 4L16 6M8 22L6 20L8 18M16 22L18 20L16 18M4 8L2 10L4 12M20 8L22 10L20 12M12 2V4M12 20V22M2 12H4M20 12H22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 className="text-golden-amber text-xl font-bold tracking-wide">
          CREW LINK
        </h1>
      </div>
    </header>
  )
}
