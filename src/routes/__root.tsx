import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AuthProvider } from "~/lib/auth";

import appCss from "~/styles/app.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LocalAmp — Get More Local Customers" },
      { name: "description", content: "An all-in-one AI platform that replaces marketing agencies for local businesses. Get a website, capture leads, and grow — all for a flat monthly fee." },
      { property: "og:title", content: "LocalAmp — Get More Local Customers" },
      { property: "og:description", content: "All-in-one AI platform for local businesses. Website, leads, and growth — flat monthly fee." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page not found</p>
        <a href="/" className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700">
          Go home
        </a>
      </div>
    </div>
  ),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-['Inter',system-ui,sans-serif]">
        {children}
        <Scripts />
      </body>
    </html>
  );
}