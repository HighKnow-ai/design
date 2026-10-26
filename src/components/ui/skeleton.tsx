/**
 * shadcn/ui `skeleton` (style radix-nova), Tenure's version (`packages/ui/src/components/ui/skeleton.tsx`),
 * which replaces Flywheel's upstream one (#616): it draws on `border/55`, quieter than shadcn's
 * accent, and stops pulsing under reduced motion (`base.css` stops it too, for a skeleton drawn
 * without this component).
 */
import { cn } from "../../lib/utils.js";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-border/55 motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

export { Skeleton };
