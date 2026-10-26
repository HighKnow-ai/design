/**
 * After-action feedback (#616), from Flywheel's `lib/notify.ts`: the one way a screen says what an
 * action just did, through the one `Toaster`. A toast is for the outcome of something the reader
 * did ("Story moved to E-3"), never for state the screen already shows, and never in place of an
 * inline error on the control that failed.
 *
 *   notify.success("Story moved to E-3", { action: { label: "Undo", onClick: () => move(back) } })
 *   notify.error("Couldn't merge FLY-12", { error })
 *
 * Words: the title says what happened in the past tense, naming the record; a description is one
 * line. Every word is the caller's (#616 point 5), the action's label included. A toast with an
 * action stays up long enough to reach it.
 */
import { toast } from "sonner";
import { messageOf } from "../components/read-error.js";

const SUCCESS_MS = 4000;
const ACTION_MS = 8000;
const ERROR_MS = 8000;

export interface NotifyAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface NotifyOptions {
  /** One line under the title. */
  readonly description?: string | undefined;
  /** A next step ("Undo", "Open board"), named by its label. Keeps the toast up for eight seconds. */
  readonly action?: NotifyAction | undefined;
  /** Replaces a toast already up (by the id an earlier call returned) instead of stacking another. */
  readonly id?: string | number | undefined;
}

export interface NotifyErrorOptions extends Omit<NotifyOptions, "action"> {
  /** The failure; its message is the description when none is given. */
  readonly error?: unknown;
}

export const notify = {
  /** An action finished: "Story moved to E-3". */
  success(title: string, options: NotifyOptions = {}): string | number {
    const { description, action, id } = options;
    return toast.success(title, {
      ...(id === undefined ? {} : { id }),
      ...(description === undefined ? {} : { description }),
      duration: action ? ACTION_MS : SUCCESS_MS,
      ...(action ? { action: { label: action.label, onClick: () => action.onClick() } } : {}),
    });
  },

  /** An action failed: "Couldn't merge FLY-12", with the failure's own message beneath. */
  error(title: string, options: NotifyErrorOptions = {}): string | number {
    const { description, error, id } = options;
    const line = description ?? messageOf(error);
    return toast.error(title, {
      ...(id === undefined ? {} : { id }),
      ...(line === undefined ? {} : { description: line }),
      duration: ERROR_MS,
      closeButton: true,
    });
  },

  /** Takes a toast down early (after its action is overtaken, say). */
  dismiss(id?: string | number): void {
    toast.dismiss(id);
  },
};
