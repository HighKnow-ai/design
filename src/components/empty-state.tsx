/**
 * The one no-content component: a heading, one line, and at most one action, drawn as
 * shadcn's `Empty`. Generalised from Tenure's `packages/ui/src/knowledge/EmptyState.tsx`, whose
 * product-specific variants stay in Tenure; Flywheel composed `Empty` inline to the same rule.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * AT MOST ONE ACTION, AND NOWHERE TO PUT A PICTURE. `action` is one object, not a list, and there
 * is no illustration or media prop: an empty state is not a place for a worked example or a
 * decorative icon. A product that needs "only this variant may carry the action" narrows its own
 * wrapper's props, as Tenure's does.
 *
 * LOADING AND FAILED ARE NOT EMPTY. Render this only once a read has resolved to nothing; a read
 * in flight is `Delayed`'s, and a failed one is `ReadError`'s.
 */
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "./ui/empty.js";
import { Button } from "./ui/button.js";
import { cn } from "../lib/utils.js";

export interface EmptyStateAction {
  readonly label: string;
  readonly onAction: () => void;
}

export interface EmptyStateProps {
  readonly heading: string;
  readonly body: string;
  /** The one primary action, when there is one. It takes focus: it is all the surface offers. */
  readonly action?: EmptyStateAction | undefined;
  readonly className?: string | undefined;
}

export function EmptyState({ heading, body, action, className }: EmptyStateProps) {
  return (
    <Empty data-slot="empty-state" className={cn("py-12", className)}>
      <EmptyHeader className="max-w-[46ch]">
        <EmptyTitle className="text-section font-semibold text-foreground">{heading}</EmptyTitle>
        <EmptyDescription className="text-body text-muted-foreground">{body}</EmptyDescription>
      </EmptyHeader>
      {action !== undefined ? (
        <EmptyContent>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- the one action takes focus: it is all the surface offers (EmptyStateProps.action) */}
          <Button variant="default" autoFocus onClick={action.onAction}>
            {action.label}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
