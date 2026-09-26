import type { ReactNode } from 'react'

type FormErrorProps = {
  children: ReactNode
}

/**
 * Inline form/validation error message styled from tokens (D27).
 *
 * Screens pass the Finnish copy; this only owns the alert presentation.
 */
export function FormError({ children }: FormErrorProps) {
  return (
    <p className="text-sm text-red-800" role="alert">
      {children}
    </p>
  )
}
