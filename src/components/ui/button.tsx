import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium select-none outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "bg-transparent text-foreground hover:bg-foreground/6",
        outline:
          "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-foreground/4",
        subtle: "bg-card text-foreground hover:bg-raised",
        danger: "bg-transparent text-destructive hover:bg-destructive/12",
      },
      size: {
        default: "h-11 rounded-full px-5 text-sm",
        sm: "h-11 rounded-full px-4 text-sm",
        lg: "h-12 rounded-full px-6 text-sm",
        icon: "size-11 rounded-full",
        chip: "h-11 rounded-full px-4 text-sm",
      },
      static: {
        true: "",
        false: "active:not-disabled:scale-[0.96]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      static: false,
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  static: isStatic,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(
        buttonVariants({ variant, size, static: isStatic }),
        "transition-[scale,background-color,box-shadow,opacity,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
        className,
      )}
      {...props}
    />
  );
}
