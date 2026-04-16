import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Zap,
  Database,
  Lock,
  ArrowRight,
  Github,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const features = [
  {
    icon: Shield,
    title: "Authentication Ready",
    description:
      "Supabase Auth with JWT tokens, auto-refresh, role-based access control, and protected routes out of the box.",
  },
  {
    icon: Zap,
    title: "Modern Stack",
    description:
      "React 19, TanStack Router & Query, Zustand for state, Tailwind CSS 4 with shadcn/ui components.",
  },
  {
    icon: Database,
    title: "NestJS API",
    description:
      "Clean modular NestJS backend with global guards, Supabase integration, and file storage support.",
  },
  {
    icon: Lock,
    title: "Secure by Default",
    description:
      "Global auth guard, RLS via service role, CORS configured, token refresh with automatic retry.",
  },
];

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Starter</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">
                Get Started
                <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                Nx + NestJS + React + Supabase
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Ship faster with a{" "}
                <span className="text-primary">production-ready</span> starter
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                A clean monorepo backbone with authentication, storage, and a
                modern UI already wired up. Stop configuring, start building.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link to="/login">
                  <Button size="lg" className="px-6">
                    Get Started
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg" className="px-6">
                    <Github className="mr-1.5 size-4" />
                    GitHub
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-border/40 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to start
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Batteries included. All the essentials are already configured
                and working together.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-border/60 bg-card/50 p-6 transition-colors hover:border-border hover:bg-card"
                >
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border/40 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to build?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Create an account and start building your next project in minutes.
            </p>
            <div className="mt-8">
              <Link to="/login">
                <Button size="lg" className="px-8">
                  Get Started Free
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex size-5 items-center justify-center rounded bg-primary">
              <Zap className="size-3 text-primary-foreground" />
            </div>
            Starter
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Nx, NestJS, React & Supabase
          </p>
        </div>
      </footer>
    </div>
  );
}
