import Link from "next/link";
import { Home, Search, Plus, TrendingUp, User } from "lucide-react";

export function BottomNav({ active }: { active: "home" | "explore" | "trends" | "profile" }) {
  const items = [
    { key: "home", label: "Home", href: "/", icon: Home },
    { key: "explore", label: "Explore", href: "/explore", icon: Search },
    { key: "trends", label: "Trends", href: "/trends", icon: TrendingUp },
    { key: "profile", label: "Profile", href: "/admin", icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle bg-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
        {items.slice(0, 2).map((item) => (
          <NavItem
            key={item.key}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={active === item.key}
          />
        ))}

        <Link
          href="/admin/add"
          className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/30"
        >
          <Plus className="h-6 w-6 text-background" strokeWidth={2.5} />
        </Link>

        {items.slice(2).map((item) => (
          <NavItem
            key={item.key}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={active === item.key}
          />
        ))}
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px]"
    >
      <Icon
        className={`h-5 w-5 ${isActive ? "text-accent" : "text-muted"}`}
        strokeWidth={isActive ? 2.5 : 2}
      />
      <span className={isActive ? "font-medium text-accent" : "text-muted"}>{label}</span>
    </Link>
  );
}
