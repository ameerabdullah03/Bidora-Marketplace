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
  useEffect(() => {
    cancelRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" className="w-full max-w-md border border-bidora-ink/15 bg-bidora-paper p-6 text-bidora-ink shadow-2xl">
      <h2 id="confirm-title" className="text-xl font-bold">{title}</h2><p id="confirm-description" className="mt-3 text-sm leading-6 text-bidora-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-3"><button ref={cancelRef} type="button" onClick={onClose} className="border border-bidora-ink/25 px-4 py-2 text-sm font-semibold hover:bg-bidora-ink/5">{cancelText}</button><button type="button" onClick={() => { void onConfirm() }} className={`px-4 py-2 text-sm font-bold text-white ${danger ? 'bg-red-700 hover:bg-red-800' : 'bg-bidora-ink hover:bg-bidora-deep'}`}>{confirmText}</button></div>
    </section>
  </div>
}
