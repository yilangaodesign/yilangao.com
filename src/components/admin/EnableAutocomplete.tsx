'use client'

import { useEffect } from 'react'

/**
 * Payload's login form sets autocomplete="off" on inputs.
 * This component overrides that so browsers can offer saved credentials.
 */
export default function EnableAutocomplete() {
  useEffect(() => {
    const form = document.querySelector('form')
    if (!form) return

    form.setAttribute('autocomplete', 'on')

    const emailInput = form.querySelector('input[type="email"], input[name="email"]')
    if (emailInput) {
      emailInput.setAttribute('autocomplete', 'username email')
      emailInput.setAttribute('name', 'email')
    }

    const passwordInput = form.querySelector('input[type="password"], input[name="password"]')
    if (passwordInput) {
      passwordInput.setAttribute('autocomplete', 'current-password')
      passwordInput.setAttribute('name', 'password')
    }

    const observer = new MutationObserver(() => {
      const newForm = document.querySelector('form')
      if (newForm) {
        newForm.setAttribute('autocomplete', 'on')
        const email = newForm.querySelector('input[type="email"], input[name="email"]')
        if (email) email.setAttribute('autocomplete', 'username email')
        const pass = newForm.querySelector('input[type="password"], input[name="password"]')
        if (pass) pass.setAttribute('autocomplete', 'current-password')
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return null
}
