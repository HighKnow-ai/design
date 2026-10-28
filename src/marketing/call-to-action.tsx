/**
 * The call to action: a closing heading on the display ramp's smallest step, one
 * line, and the page's actions. The actions are the caller's `Button`s: one filled primary at
 * most, and the ghost or outline beside it draws its boundary on `--input` (a defect: the
 * apex's ghost call to action measured 1.52:1 against WCAG 1.4.11's 3:1).
 */
import type { ReactNode } from "react";
import { cn } from "../lib/utils.js";
import { MARKETING_CONTAINER } from "./layout.js";

export interface CallToActionProps {
  readonly title: string;
  readonly body?: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string | undefined;
}

export function CallToAction({ title, body, actions, className }: CallToActionProps) {
  return (
    <section
      data-slot="call-to-action"
      className={cn(MARKETING_CONTAINER, "py-16 lg:py-24", className)}
    >
      <div className="flex max-w-[40rem] flex-col items-start gap-5">
        <h2 className="m-0 font-heading text-display-3 text-balance text-foreground">{title}</h2>
        {body !== undefined ? (
          <p className="m-0 text-lead leading-prose text-muted-foreground">{body}</p>
        ) : null}
        {actions !== undefined ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}
