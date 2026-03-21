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
import { useAuth, useLogout } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "../constants";

export const UserDropdown = () => {
  const { user } = useAuth();
  const { mutate: logout } = useLogout();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  // Logic to determine current context
  const isSimulationPage = location.pathname.startsWith("/simulation");
  const isDocumentationPage = location.pathname.startsWith("/documentation");
  const isPortfolioPage =
    location.pathname === "/home" || location.pathname === "/";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="items-center gap-2 p-0 md:px-2.5 md:py-1.5 h-auto rounded-lg md:border md:bg-muted/30 md:backdrop-blur-sm hover:bg-muted/50"
        >
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt=""
              referrerPolicy="no-referrer"
              className="w-9 h-9 md:w-7 md:h-7 rounded-full border border-border"
            />
          ) : (
            <div className="w-9 h-9 md:w-7 md:h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm md:text-xs font-bold border border-border">
              {user?.name?.charAt(0) || "?"}
            </div>
          )}
          <div className="hidden md:flex flex-col items-start text-left min-w-0 max-w-[1400px]">
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

        {/*. NAVIGATION SECTION */}

        {/* Show Portfolio link if not on Home/Dashboard */}
        {!isPortfolioPage && (
          <DropdownMenuItem
            className="py-2 px-2 text-sm"
            onClick={() => navigate("/home")}
          >
            <Icons.Menu className="mr-2 h-4 w-4" />
            Portfolio
          </DropdownMenuItem>
        )}

        {/* Show Simulation link if not on Simulation page */}
        {!isSimulationPage && (
          <DropdownMenuItem
            className="py-2 px-2 text-sm"
            onClick={() => navigate("/simulation")}
          >
            <Icons.Play className="mr-2 h-4 w-4" />
            Simulation
          </DropdownMenuItem>
        )}

        {/* Show Documentation link if not on Documentation page */}
        {!isDocumentationPage && (
          <DropdownMenuItem
            className="py-2 px-2 text-sm"
            onClick={() => navigate("/documentation")}
          >
            <Icons.BookOpen className="mr-2 h-4 w-4" />
            Documentation
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1" />

        {/* --- THEME & LOGOUT SECTION --- */}
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

        <DropdownMenuItem
          className="py-2 px-2 text-sm text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
