'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { ComponentProps } from 'react'

type SubmitButtonProps = ComponentProps<'button'> & {
    text?: string
    loadingText?: string
}

export function SubmitButton({
    children,
    className,
    text = 'Submit',
    loadingText = 'Loading...',
    ...props
}: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            aria-disabled={pending}
            className={className}
            {...props}
        >
            {pending ? (
                <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {loadingText}
                </div>
            ) : (
                children || text
            )}
        </button>
    )
}
