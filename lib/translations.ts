export const translations = {
  en: {
    // Hero
    heroTagline: 'Real-time construction communication',
    heroTitle: 'Bridge the language gap',
    heroTitleHighlight: ' between workers and supervisors.',
    heroDescription: 'Accept voice input, get instant translation, and share actionable summaries—from the first message to the last.',

    // Header
    signIn: 'Sign in',

    // Control panel
    workerIdLabel: 'Worker ID',
    workerIdPlaceholder: 'e.g. worker-001',

    // Conversation list
    emptyStateGreeting: 'Hello!',
    emptyStateInstruction: 'Tap the microphone and speak in Spanish.',
    emptyStateNote: 'Your message will be translated and sent to your supervisor.',
    processing: 'Processing...',

    // Message bubble
    sentToSupervisor: 'Sent to supervisor',

    // Microphone button
    recording: 'Recording...',
    tapToSpeak: 'Tap to speak',

    // Urgency badge
    urgent: 'URGENT',

    // Errors
    speechNotSupported: 'Speech recognition is not available in this browser. Please use Chrome or Edge.',
    sendError: 'Error sending message. Please try again.',
  },
  es: {
    // Hero
    heroTagline: 'Comunicación en tiempo real en construcción',
    heroTitle: 'Conecta la brecha idiomática',
    heroTitleHighlight: ' entre trabajadores y supervisores.',
    heroDescription: 'Acepta entrada de voz, obtén traducción instantánea y comparte resúmenes accionables—desde el primer mensaje hasta el último.',

    // Header
    signIn: 'Iniciar sesión',

    // Control panel
    workerIdLabel: 'ID del trabajador',
    workerIdPlaceholder: 'ej. worker-001',

    // Conversation list
    emptyStateGreeting: '¡Hola!',
    emptyStateInstruction: 'Pulsa el micrófono y habla en español.',
    emptyStateNote: 'Tu mensaje se traducirá y se enviará a tu supervisor.',
    processing: 'Procesando...',

    // Message bubble
    sentToSupervisor: 'Enviado al supervisor',

    // Microphone button
    recording: 'Grabando...',
    tapToSpeak: 'Toca para hablar',

    // Urgency badge
    urgent: 'URGENTE',

    // Errors
    speechNotSupported: 'El reconocimiento de voz no está disponible en este navegador. Por favor usa Chrome o Edge.',
    sendError: 'Error al enviar mensaje. Por favor intenta de nuevo.',
  },
} as const

export type Language = 'en' | 'es'
