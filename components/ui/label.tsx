// components/ui/label.tsx
'use client';

import * as React from 'react';
import * as LabelPrimitives from '@radix-ui/react-label';
import { cn } from '@/lib/utils'; // Ensure this import is correct

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitives.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitives.Root
    ref={ref}
    className={cn('text-white', className)} // Use cn from utils
    {...props}
  />
));

Label.displayName = LabelPrimitives.Root.displayName;

export { Label };
