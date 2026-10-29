/**
 * A read that failed, in place of the content it could not load: an icon, a title naming
 * what failed, one line, and a retry. Tenure's `ReadError` (`packages/ui/src/shell/ReadError.tsx`)
 * and Flywheel's (`flywheel/packages/desktop/src/components/ReadError.tsx`) as one component.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * WHERE THE RAW MESSAGE GOES IS THE ONE THING THE PRODUCTS DISAGREED ON, SO IT IS ONE PROP.
 *   `rawMessage="title"` (the default): the message travels in the `title` attribute, a hover for
 *     the person forwarding a screenshot to support, and never reaches the page. Tenure's readers
 *     are not developers, and a raw reason code never reaches their screen.
 *   `rawMessage="disclosure"`: the message folds behind a disclosure in the code face, for a bug
 *     report. Flywheel's readers are developers.
 *
 * THE RETRY IS THE QUERY'S OWN `refetch`, shown pending while it runs (`retrying`, normally the
 * query's `isFetching`), so the reader sees the attempt and cannot press twice. With no `onRetry`
 * there is no button: a failure no retry can fix offers none.
 *
 * Every visible word is the caller's: the title, the line, and the two labels.
 */
import { ChevronRight, OctagonX, RotateCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert.js";
import { Button } from "./ui/button.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible.js";
import { cn } from "../lib/utils.js";

type RetryProps =
  | { readonly onRetry?: undefined; readonly retryLabel?: undefined; readonly retrying?: undefined }
  | {
      /** The query's `refetch`. */
      readonly onRetry: () => void;
      /** The button's word: "Try again". */
      readonly retryLabel: string;
      /** True while the retry runs: the button shows its spinner and swallows presses. */
      readonly retrying?: boolean | undefined;
    };

type RawMessageProps =
  | { readonly rawMessage?: "title" | undefined; readonly detailsLabel?: undefined }
  | {
      readonly rawMessage: "disclosure";
      /** The disclosure's word: "Details". */
      readonly detailsLabel: string;
    };

export type ReadErrorProps = {
  /** What failed, in the page's words: "The meeting list could not be loaded." */
  readonly title: string;
  /** One line under it. Absent or `""`, there is no line. */
  readonly description?: string | undefined;
  /** The failure itself. Where its message goes is `rawMessage`'s business. */
  readonly error?: unknown;
  readonly className?: string | undefined;
} & RetryProps &
  RawMessageProps;

/** The failure's message, or `undefined` when there is nothing worth showing. */
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
    // Not serialisable (a cycle, a BigInt): `String()` would show "[object Object]", which is
    // nothing worth showing.
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
