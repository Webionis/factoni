import {
  pageDescriptionClassName,
  pageEyebrowClassName,
  pageTitleClassName,
} from "@/lib/constants/ui";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  descriptionClassName?: string;
  eyebrow?: string;
  titleAccessory?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  descriptionClassName,
  eyebrow,
  titleAccessory,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className={pageEyebrowClassName}>{eyebrow}</p>
        ) : null}
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          <h1 className={cn(pageTitleClassName, "text-2xl sm:text-3xl")}>{title}</h1>
          {titleAccessory}
        </div>
        {description ? (
          <p className={cn(pageDescriptionClassName, descriptionClassName)}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex w-full shrink-0 sm:w-auto [&_a]:h-11 [&_a]:w-full [&_button]:h-11 [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}
