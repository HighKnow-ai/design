import { ChevronRight, OctagonX, RotateCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert.js";
import { Button } from "./ui/button.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible.js";
import { cn } from "../lib/utils.js";

type RetryProps =
  | { readonly onRetry?: undefined; readonly retryLabel?: undefined; readonly retrying?: undefined }
  | {
      readonly onRetry: () => void;
      readonly retryLabel: string;
      readonly retrying?: boolean | undefined;
    };

type RawMessageProps =
  | { readonly rawMessage?: "title" | undefined; readonly detailsLabel?: undefined }
  | {
      readonly rawMessage: "disclosure";
      readonly detailsLabel: string;
    };

export type ReadErrorProps = {
  readonly title: string;
  readonly description?: string | undefined;
  readonly error?: unknown;
  readonly className?: string | undefined;
} & RetryProps &
  RawMessageProps;

export function messageOf(error: unknown): string | undefined {
  if (error === undefined || error === null) return undefined;
  if (error instanceof Error) return error.message || undefined;
  if (typeof error === "string") return error || undefined;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message || undefined;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return undefined;
  }
}

export function ReadError(props: ReadErrorProps): React.JSX.Element {
  const { title, description, error, className } = props;
  const raw = messageOf(error);
  const inTitle = props.rawMessage !== "disclosure";
  return (
    <Alert
      variant="destructive"
      data-slot="read-error"
      {...(inTitle && raw !== undefined ? { title: raw } : {})}
      className={cn(
        "animate-in gap-y-1.5 rounded-lg px-4 py-3.5 shadow-card duration-(--duration-state) fade-in",
        className,
      )}
    >
      <OctagonX aria-hidden="true" />
      <AlertTitle className="text-body font-semibold">{title}</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-2.5 text-small text-muted-foreground [&_p:not(:last-child)]:mb-0">
        {description === undefined || description === "" ? null : (
          <p className="m-0">{description}</p>
        )}
        {props.onRetry !== undefined ? (
          <Button
            size="sm"
            variant="outline"
            loading={props.retrying ?? false}
            onClick={props.onRetry}
          >
            <RotateCw aria-hidden="true" />
            {props.retryLabel}
          </Button>
        ) : null}
        {props.rawMessage === "disclosure" && raw !== undefined ? (
          <Collapsible className="w-full">
            <CollapsibleTrigger className="group/details inline-flex items-center gap-1 rounded-sm text-meta text-muted-foreground transition-colors hover:text-foreground">
              <ChevronRight
                aria-hidden="true"
                className="size-3.5 transition-transform group-data-[state=open]/details:rotate-90"
              />
              {props.detailsLabel}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="m-0 mt-1.5 max-h-40 overflow-auto rounded-md bg-muted px-2.5 py-2 font-mono text-meta whitespace-pre-wrap text-foreground">
                {raw}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
