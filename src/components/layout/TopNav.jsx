import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TopNav({ userRole }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-6">
      <SidebarTrigger />

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">Welcome back!</p>
          <p className="text-xs text-muted-foreground capitalize">
            {userRole} User
          </p>
        </div>
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {userRole === "admin" ? "AD" : "ST"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
