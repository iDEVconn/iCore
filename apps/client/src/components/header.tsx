import { useNavigate } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/queries/auth";
import { useTheme } from "@/components/theme-provider";

interface HeaderProps {
  email: string;
  role: string;
}

export function Header({ email, role }: HeaderProps) {
  const navigate = useNavigate();
  const logout = useLogout();
  const { theme, setTheme, resolved } = useTheme();

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => navigate({ to: "/login" }),
    });
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/40 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="size-5" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {email}{" "}
          {role === "admin" && (
            <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
              admin
            </span>
          )}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
        >
          {resolved === "dark" ? "Light" : "Dark"}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-1.5 size-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
