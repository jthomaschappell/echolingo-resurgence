'use client'

interface MicrophoneButtonProps {
  isRecording: boolean
  onClick: () => void
  disabled?: boolean
}

export default function MicrophoneButton({
  isRecording,
  onClick,
  disabled,
}: MicrophoneButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-primary-orange text-white py-4 px-6 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all ${
        isRecording
          ? 'animate-pulse bg-opacity-90'
          : 'hover:bg-opacity-90 active:bg-opacity-80'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        {isRecording ? (
          <path
            d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
            fill="currentColor"
          />
        ) : (
          <path
            d="M12 14C13.1 14 14 13.1 14 12V6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6V12C10 13.1 10.9 14 12 14Z"
            fill="currentColor"
          />
        )}
        <path
          d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H7V12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10H19Z"
          fill="currentColor"
        />
        <path
          d="M11 22H13V24H11V22Z"
          fill="currentColor"
        />
      </svg>
      <span>{isRecording ? 'Grabando...' : 'Pulsa para hablar'}</span>
    </button>
  )
}
