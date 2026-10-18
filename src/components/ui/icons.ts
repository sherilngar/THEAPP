import {
  BedDouble,
  Briefcase,
  Car,
  ChefHat,
  ConciergeBell,
  Flower2,
  MonitorSmartphone,
  ShieldCheck,
  Shirt,
  Stethoscope,
  UserCog,
  UtensilsCrossed,
  Waves,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { DepartmentId } from '../../domain/types';

export const DEPT_ICON: Record<DepartmentId, LucideIcon> = {
  frontoffice: ConciergeBell,
  housekeeping: BedDouble,
  laundry: Shirt,
  engineering: Wrench,
  ird: UtensilsCrossed,
  restaurants: ChefHat,
  spa: Flower2,
  recreation: Waves,
  concierge: Car,
  security: ShieldCheck,
  it: MonitorSmartphone,
  dutymanager: UserCog,
};

export const SECTION_ICON: Record<string, LucideIcon> = {
  ...DEPT_ICON,
  events: Briefcase,
  medical: Stethoscope,
};
