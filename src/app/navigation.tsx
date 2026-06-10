import type {SvgIconComponent} from "@mui/icons-material";
import {DashboardIcon, MatchIcon, PlayersIcon, RankingIcon} from "../icons";
import {DashboardPage, PlayersPage, RankingPage} from "../pages";
import {MatchesPage} from "../pages/matches";

type NavigationItem = {
  path: string;
  label: string;
  icon: SvgIconComponent;
  element: React.ReactNode;
  admin?: boolean;
};

const navigationItems: NavigationItem[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: DashboardIcon,
    element: <DashboardPage sx={{py: 2}} />,
  },
  {
    path: "/ranking",
    label: "Classifica",
    icon: RankingIcon,
    element: <RankingPage sx={{flex: 1, py: 2}} />,
  },
  {
    path: "/matches",
    label: "Partite",
    icon: MatchIcon,
    element: <MatchesPage sx={{flex: 1}} />,
  },
  {
    path: "/players",
    label: "Giocatori",
    icon: PlayersIcon,
    element: <PlayersPage sx={{flex: 1}} />,
  },
];

export {navigationItems};
