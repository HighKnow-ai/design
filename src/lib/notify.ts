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
  readonly description?: string | undefined;
  readonly action?: NotifyAction | undefined;
  readonly id?: string | number | undefined;
}

export interface NotifyErrorOptions extends Omit<NotifyOptions, "action"> {
  readonly error?: unknown;
}

export const notify = {
  success(title: string, options: NotifyOptions = {}): string | number {
    const { description, action, id } = options;
    return toast.success(title, {
      ...(id === undefined ? {} : { id }),
      ...(description === undefined ? {} : { description }),
      duration: action ? ACTION_MS : SUCCESS_MS,
      ...(action ? { action: { label: action.label, onClick: () => action.onClick() } } : {}),
    });
  },

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

  dismiss(id?: string | number): void {
    toast.dismiss(id);
  },
};
