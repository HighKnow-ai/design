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
          {/* oxlint-disable-next-line jsx-a11y/no-autofocus -- the one action takes focus: it is all the surface offers (EmptyStateProps.action) */}
          <Button variant="default" autoFocus onClick={action.onAction}>
            {action.label}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
