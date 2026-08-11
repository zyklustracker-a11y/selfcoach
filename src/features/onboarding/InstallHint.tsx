import { useState } from 'react'

import { Button, Card } from '@/components'
import { isIos, isStandalone } from '@/lib/platform'
import { t } from '@/lib/strings'

const DISMISSED = 'readcoach:install-hint-dismissed'

/**
 * iOS has no install prompt, so the app has to explain the manual route itself
 * (concept 11). Only shown in a Safari tab — never once the app runs from the
 * home screen.
 */
export function InstallHint() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED) === '1')

  if (dismissed || isStandalone() || !isIos()) return null

  return (
    <div className="px-6.5 pb-5">
      <Card>
        <p className="font-serif text-entry text-text-primary">{t.install.title}</p>
        <p className="mt-1.5 text-body text-text-muted">{t.install.body}</p>
        <div className="mt-2">
          <Button
            variant="ghost"
            onClick={() => {
              localStorage.setItem(DISMISSED, '1')
              setDismissed(true)
            }}
          >
            {t.install.dismiss}
          </Button>
        </div>
      </Card>
    </div>
  )
}
