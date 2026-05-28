import type {SvgIconComponent} from "@mui/icons-material";
import {
  DashboardIcon,
  MatchIcon,
  PlayersIcon,
  RankingIcon,
  SeasonIcon,
} from "../icons";
import {
  DashboardPage,
  MatchesPage,
  PlayersPage,
  RankingPage,
  SeasonsPage,
} from "../pages";

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
    element: <DashboardPage sx={{flex: 1, p: 2}} />,
  },
  {
    path: "/seasons",
    label: "Stagioni",
    icon: SeasonIcon,
    element: <SeasonsPage sx={{flex: 1, p: 2}} />,
    admin: true,
  },
  {
    path: "/ranking",
    label: "Classifica",
    icon: RankingIcon,
    element: <RankingPage sx={{flex: 1, p: 2}} />,
  },
  {
    path: "/matches",
    label: "Partite",
    icon: MatchIcon,
    element: <MatchesPage sx={{flex: 1, p: 2}} />,
  },
  {
    path: "/players",
    label: "Giocatori",
    icon: PlayersIcon,
    element: <PlayersPage sx={{flex: 1, p: 2}} />,
  },
];

export {navigationItems};
