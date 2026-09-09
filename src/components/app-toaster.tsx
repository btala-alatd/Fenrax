import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="dark"
      position="top-center"
      gap={8}
      toastOptions={{
        classNames: {
          toast:
            "bg-card text-foreground border-transparent shadow-[var(--shadow-border)] font-sans",
          title: "text-foreground",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
