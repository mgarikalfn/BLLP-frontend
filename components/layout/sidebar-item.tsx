"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ElementType } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  label: string;
  iconSrc?: string;
  icon?: ElementType;
  href: string;
};

export const SidebarItem = ({
  label,
  iconSrc,
  icon: Icon,
  href,
}: Props) => {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Button
      variant={active ? "sidebarOutline"  : "sidebar"}
      className="justify-start h-13"
      asChild
    >
      <Link href={href}>
        {iconSrc && (
          <Image
            src={iconSrc}
            alt={label}
            className="mr-5"
            height={32}
            width={32}
          />
        )}
        {Icon && <Icon className="mr-5 h-8 w-8" />}
        {label}
      </Link>
    </Button>
  );
};
