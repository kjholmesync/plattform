'use client'
import { css } from '@app/styled-system/css'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { IconClose } from '@republik/icons'

export default function Overlay(props: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          router.back()
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className={css({
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'stretch',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.05)',
          })}
        >
          <Dialog.Content
            className={css({
              m: '10',
              position: 'relative',
              background: 'white',
            })}
          >
            <VisuallyHidden>
              <Dialog.Title></Dialog.Title>
              <Dialog.Description></Dialog.Description>
            </VisuallyHidden>
            {props.children}
            <Dialog.Close
              className={css({ position: 'absolute', top: '4', right: '4' })}
            >
              <IconClose size={24} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}