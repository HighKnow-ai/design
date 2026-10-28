/**
 * The one confirmation for an action that cannot be taken back, from Flywheel's
 * `components/ConfirmDestructive.tsx`. Both products state the rule: destructive is a text button,
 * and it always confirms in an AlertDialog. The question is the title ("Drop FLY-12?"), the
 * consequence is one line, Cancel sits on the left as outline and the action on the right as
 * `destructive`, named by its verb and object ("Drop the Story"), never "OK" or "Yes".
 *
 * `onConfirm` may return a promise: the action shows as pending and the dialog cannot be dismissed
 * until it settles; it closes on success, and on failure stays open with the failure's message, so
 * the reader can try again or cancel. Open it from a `trigger`, or control it with `open` and
 * `onOpenChange`.
 *
 * Every visible word is the caller's, Cancel included. `failureLabel` is what shows
 * when a failure carries no message of its own.
 */
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
  /** Shown when the action fails with no message of its own. Without it, the failure's text. */
  readonly failureLabel?: string | undefined;
  /** The action's icon, as on the button that opened the dialog. */
  readonly icon?: ReactNode;
  readonly onConfirm: () => unknown;
  /** Anything more the decision needs, between the description and the buttons. */
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
