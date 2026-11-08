import { useEffect, useRef } from 'react'

interface ConfirmationDialogProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void | Promise<void>
  onClose: () => void
}

export default function ConfirmationDialog({ title, description, confirmText = 'Confirm', cancelText = 'Go back', danger = false, onConfirm, onClose }: ConfirmationDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    cancelRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { closeRef.current(); return }
      if (event.key !== 'Tab') return
      if (event.shiftKey && document.activeElement === cancelRef.current) {
        event.preventDefault(); confirmRef.current?.focus()
      } else if (!event.shiftKey && document.activeElement === confirmRef.current) {
        event.preventDefault(); cancelRef.current?.focus()
      } else if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault(); cancelRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('keydown', handleKey); previouslyFocused?.focus() }
  }, [])
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" className="w-full max-w-md border border-bidora-ink/15 bg-bidora-paper p-6 text-bidora-ink shadow-2xl">
      <h2 id="confirm-title" className="text-xl font-bold">{title}</h2><p id="confirm-description" className="mt-3 text-sm leading-6 text-bidora-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-3"><button ref={cancelRef} type="button" onClick={onClose} className="border border-bidora-ink/25 px-4 py-2 text-sm font-semibold hover:bg-bidora-ink/5">{cancelText}</button><button ref={confirmRef} type="button" onClick={() => { void onConfirm() }} className={`px-4 py-2 text-sm font-bold ${danger ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-bidora-ink text-white hover:bg-bidora-deep'}`}>{confirmText}</button></div>
    </section>
  </div>
}
