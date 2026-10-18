import { createContext, useContext } from 'react';
import { strings, type Strings } from '../../i18n/strings';
import { DEMO_GUEST_ID } from '../../data/demo';

export interface GuestUi {
  guestId: string;
  lang: 'en' | 'ar';
  t: Strings;
  embedded: boolean;
  goTo: (tab: 'chat' | 'services' | 'requests') => void;
}

export const GuestUiContext = createContext<GuestUi>({
  guestId: DEMO_GUEST_ID,
  lang: 'en',
  t: strings('en'),
  embedded: false,
  goTo: () => {},
});
export const useGuestUi = () => useContext(GuestUiContext);
