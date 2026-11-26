import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip.js";
import { cn } from "../lib/utils.js";

export function Tip({
  content,
  children,
}: {
  readonly content: ReactNode;
  readonly children: ReactElement;
}) {
  if (content === null || content === undefined || content === "" || content === false) {
    return children;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-sm">{content}</TooltipContent>
    </Tooltip>
  );
}

export function TruncateTip({
  text,
  mono = false,
  children,
}: {
  readonly text: ReactNode;
  readonly mono?: boolean | undefined;
  readonly children: ReactElement;
}) {
  const trigger = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  function cut() {
    const el = trigger.current;
    return !!el && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
  }
  if (text === null || text === undefined || text === "") return children;
  return (
    <Tooltip open={open} onOpenChange={(next) => setOpen(next && cut())}>
      <TooltipTrigger
        asChild
        ref={(element) => {
          trigger.current = element;
        }}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        className={cn("max-w-md break-words whitespace-pre-wrap", mono && "font-mono break-all")}
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
