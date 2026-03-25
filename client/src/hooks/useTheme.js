import { themes } from '../themes/timeThemes';

export function useTheme(slot) {
  return themes[slot] || themes.idle;
}
