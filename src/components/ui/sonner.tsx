import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

/*
 * After-action feedback, Flywheel's rewrite of shadcn's `sonner`: one Toaster, mounted once at the
 * app's root, bottom-right. A toast is a popover-ground card on the overlay shadow; its icon carries
 * the outcome (a check for done, the octagon in red ink for failed) beside its words, never colour
 * alone. Fire toasts through `notify` (`lib/notify.ts`), not `sonner` directly. The scheme follows
 * the system, as `.dark` does; Sonner drops its own motion under reduced motion.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      // "system" reads matchMedia; an environment without it (jsdom) gets light, as colorScheme.ts does.
      theme={typeof window.matchMedia === "function" ? "system" : "light"}
      position="bottom-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4 text-destructive-text" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--width": "360px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast font-sans shadow-overlay! gap-2.5!",
          title: "text-body font-semibold",
          description: "text-small text-muted-foreground!",
          actionButton:
            "h-7.5! rounded-md! bg-secondary! px-2.75! text-small! font-semibold! text-secondary-foreground! hover:bg-accent!",
          cancelButton: "h-7.5! rounded-md! px-2.75! text-small!",
          closeButton: "border-border! bg-popover! text-muted-foreground! hover:text-foreground!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
