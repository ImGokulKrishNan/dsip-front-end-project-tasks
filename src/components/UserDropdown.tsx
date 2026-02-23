import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";

export const UserDropdown = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="items-center gap-2 px-2.5 py-1.5 h-auto rounded-lg border bg-muted/30 backdrop-blur-sm hover:bg-muted/50"
        >
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt=""
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full border border-border"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold border border-border">
              {user?.name?.charAt(0) || "?"}
            </div>
          )}
          <div className="hidden md:flex flex-col items-start text-left min-w-0 max-w-[140px]">
            <span className="text-xs font-medium truncate w-full">
              {user?.name || "User"}
            </span>
            <span className="text-[9px] text-muted-foreground truncate w-full leading-tight">
              {user?.email || ""}
            </span>
          </div>
          <ChevronDown className="hidden md:flex h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 p-1.5 text-sm">
        <DropdownMenuLabel className="font-normal px-2 py-1.5">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          className="py-2 px-2 text-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light mode
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark mode
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem className="py-2 px-2 text-sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
