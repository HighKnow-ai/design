import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog.js";
import { Button } from "./ui/button.js";
import { messageOf } from "./read-error.js";

export interface ConfirmDestructiveProps {
  readonly trigger?: ReactNode;
  readonly open?: boolean | undefined;
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  readonly title: string;
  readonly description: ReactNode;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly failureLabel?: string | undefined;
  readonly icon?: ReactNode;
  readonly onConfirm: () => unknown;
  readonly children?: ReactNode;
}

export function ConfirmDestructive({
  trigger,
  open: openProp,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  failureLabel,
  icon,
  onConfirm,
  children,
}: ConfirmDestructiveProps) {
  const [openState, setOpenState] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = openProp ?? openState;

  function failed(caught: unknown) {
    setError(messageOf(caught) ?? failureLabel ?? String(caught));
  }

  function setOpen(next: boolean) {
    if (pending) return;
    if (!next) setError(null);
    if (openProp === undefined) setOpenState(next);
    onOpenChange?.(next);
  }

  async function confirm() {
    if (pending) return;
    setError(null);
    let result: unknown;
    try {
      result = onConfirm();
    } catch (caught) {
      failed(caught);
      return;
    }
    if (result instanceof Promise) {
      setPending(true);
      try {
        await result;
      } catch (caught) {
        setPending(false);
        failed(caught);
        return;
      }
      setPending(false);
    }
    if (openProp === undefined) setOpenState(false);
    onOpenChange?.(false);
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      {/* The content's own `data-[size=default]:sm:max-w-sm` outranks a bare `sm:max-w-md`, so the
          width names the same variant; a long object name in the title wraps instead of widening. */}
      <AlertDialogContent className="data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-section font-semibold wrap-anywhere">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        {error !== null ? (
          <p role="alert" className="m-0 text-small text-destructive-text">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{cancelLabel}</AlertDialogCancel>
          <Button variant="destructive" loading={pending} onClick={() => void confirm()}>
            {icon}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
