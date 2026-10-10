import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px active:shadow-none',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1),inset_0_-1px_0_rgba(0,0,0,0.15)] hover:bg-accent-hover',
        destructive:
          'bg-destructive text-white shadow-[0_1px_2px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1),inset_0_-1px_0_rgba(0,0,0,0.15)] hover:opacity-90',
        outline:
          'border border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(0,0,0,0.04)] hover:bg-surface hover:border-border-strong',
        secondary:
          'bg-surface text-foreground border border-border shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_-1px_0_rgba(0,0,0,0.04)] hover:bg-hover',
        ghost:
          'hover:bg-surface hover:text-foreground shadow-none',
        link: 'text-accent underline-offset-4 hover:underline shadow-none',
      },
      size: {
        default: 'h-8 px-4 py-1',
        sm: 'h-7 px-3 text-xs',
        lg: 'h-10 px-6 py-2',
        icon: 'h-8 w-8',
        'icon-sm': 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
