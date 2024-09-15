import { SidebarItem } from '../../sidebar-item/models/sidebar-item.model';

export const sidebarMock: SidebarItem[] = [
  {
    icon: 'dashboard',
    title: 'Dashboard',
    route: '/dashboard',
    selected: false,
  },
  {
    icon: 'leaderboard',
    title: 'Estadísticas',
    route: '/estadisticas',
    selected: false
  },
  {
    icon: 'description',
    title: 'Archivos',
    route: '/archivos',
    selected: false
  },
  {
    icon: 'groups',
    title: 'RRHH',
    route: '/recursos-humanos',
    selected: false,
  },
  {
    icon: 'person',
    title: 'Perfil',
    route: '/perfil',
    selected: false,
  },
];
