import {
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuItems,
  MenuItemsProps,
  MenuProps,
} from "@headlessui/react";
import Link from "next/link";
import type React from "react";
import { cn } from "@/client/utils";

export function Dropdown(props: MenuProps) {
  return <Menu {...props} />;
}

export function DropdownButton(props: MenuButtonProps) {
  return <MenuButton {...props} />;
}

export function DropdownMenu({ anchor = "bottom start", ...props }: MenuItemsProps) {
  return (
    <MenuItems
      anchor={anchor}
      className="min-w-38 rounded-lg bg-white/75 p-0.5 shadow-sm outline outline-neutral-950/5 backdrop-blur-sm [--anchor-gap:--spacing(1)] [--anchor-offset:--spacing(1)] dark:bg-neutral-950/75 dark:outline-white/10"
      {...props}
    />
  );
}

export function DropdownItem({
  href,
  onClick,
  children,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const defaultClassName =
    "block w-full rounded-md px-3 py-0.5 text-sm/7 text-neutral-950 focus:outline-none data-focus:bg-primary-500 data-focus:text-white dark:text-white";

  return (
    <MenuItem>
      {href ? (
        <Link href={href} className={cn(defaultClassName, className)}>
          {children}
        </Link>
      ) : (
        <button onClick={onClick} className={cn(defaultClassName, className)} type="button">
          {children}
        </button>
      )}
    </MenuItem>
  );
}
