import * as React from "react";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";

import { buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }) => (
  <nav className={cn(className)} {...props} />
);

Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));

PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn(className)} {...props} />
));

PaginationItem.displayName = "PaginationItem";

// Continuing with PaginationLink, PaginationPrevious, and others similarly by removing TS types...

const PaginationLink = ({ className, isActive, size = "icon", ...props }) => (
  <a
    className={cn(
      buttonVariants({
        variant: "ghost",
        size,
      }),
      isActive && "bg-accent shadow-md hover:bg-accent",
      className
    )}
    {...props}
  />
);

PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({ className, ...props }) => (
  <button
    className={cn(buttonVariants(), className)}
    aria-label="Previous"
    {...props}
  >
    <ChevronLeft className="mr-2 h-4 w-4" />
    Previous
  </button>
);

PaginationPrevious.displayName = "PaginationPrevious";

// Similarly for PaginationNext and PaginationMore components...

const PaginationNext = ({ className, ...props }) => (
  <button
    className={cn(buttonVariants(), className)}
    aria-label="Next"
    {...props}
  >
    Next
    <ChevronRight className="ml-2 h-4 w-4" />
  </button>
);

PaginationNext.displayName = "PaginationNext";

const PaginationMore = ({ className, ...props }) => (
  <button
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
  </button>
);

PaginationMore.displayName = "PaginationMore";

export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationMore,
};
