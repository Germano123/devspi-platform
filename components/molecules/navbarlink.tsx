import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavbarLinkProps {
  label: string;
  href: string;
  icon?: ReactNode;
}

export const NavbarLink = ({ label, href, icon }: NavbarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`text-sm flex items-center gap-1 ${
        isActive ? "text-primary font-medium" : "text-muted-foreground"
      }`}
    >
      <span className="flex items-center gap-1">
        {icon}
        {label}
      </span>
    </Link>
  );
};
