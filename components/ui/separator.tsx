/**
 * Separator Component
 * 
 * A visual separator component for dividing content sections.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Separator({ orientation = 'horizontal', className }: SeparatorProps) {
  return (
    <div
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
    />
  );
}