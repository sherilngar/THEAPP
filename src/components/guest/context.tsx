import { createContext, useContext } from 'react';
import { strings, type Strings } from '../../i18n/strings';

export interface GuestUi {
  lang: 'en' | 'ar';
  t: Strings;
  embedded: boolean;
  goTo: (tab: 'chat' | 'services' | 'requests') => void;
}

export const GuestUiContext = createContext<GuestUi>({
  lang: 'en',
  t: strings('en'),
  embedded: false,
  goTo: () => {},
});
export const useGuestUi = () => useContext(GuestUiContext);
