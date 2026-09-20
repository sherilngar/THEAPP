const TYPE_COLOR = {
  KGA: "var(--c-kga)", KGAOV: "var(--c-kgaov)", KGE: "var(--c-kge)", KGEOV: "var(--c-kgeov)",
  TWA: "var(--c-twa)", TWAOV: "var(--c-twaov)", SKA: "var(--c-ska)", SKB: "var(--c-skb)",
  SKC: "var(--c-skc)", SKD: "var(--c-skd)", SKP: "var(--c-skp)", SXA: "var(--c-sxa)", PI: "var(--c-pi)",
};

const UPSELL_TIERS = [{"key": "t1", "label": "Occupancy 85\u2013100%", "extraPax": 570, "grid": {"KGA": {"KGAOV": 90, "KGE": 180, "KGEOV": 270, "SKA": 1170, "SKB": 1260, "SKC": 1350, "D2A/D2C": 1485, "D2B/D2D": 1575, "SKD": 1710, "SKP": 2250, "SXA": 3150}, "KGAOV": {"KGE": 90, "KGEOV": 180, "SKA": 1080, "SKB": 1170, "SKC": 1260, "D2A/D2C": 1395, "D2B/D2D": 1485, "SKD": 1620, "SKP": 2160, "SXA": 3060}, "KGE": {"KGEOV": 90, "SKA": 990, "SKB": 1080, "SKC": 1170, "D2A/D2C": 1305, "D2B/D2D": 1395, "SKD": 1530, "SKP": 2070, "SXA": 2970}, "KGEOV": {"SKA": 900, "SKB": 990, "SKC": 1080, "D2A/D2C": 1215, "D2B/D2D": 1305, "SKD": 1440, "SKP": 1980, "SXA": 2880}, "SKA": {"SKB": 90, "SKC": 180, "SKD": 540, "SKP": 1080, "SXA": 1980}, "SKB": {"SKC": 90, "SKD": 450, "SKP": 990, "SXA": 1890}, "SKC": {"SKD": 360, "SKP": 900, "SXA": 1800}, "D2A/D2C": {"D2B/D2D": 90, "SKD": 225, "SKP": 765, "SXA": 1665}, "D2B/D2D": {"SKD": 135, "SKP": 675, "SXA": 1575}, "SKD": {"SKP": 540, "SXA": 1440}, "SKP": {"SXA": 900}}}, {"key": "t2", "label": "Occupancy 70\u201385%", "extraPax": 570, "grid": {"KGA": {"KGAOV": 70, "KGE": 140, "KGEOV": 210, "SKA": 910, "SKB": 980, "SKC": 1050, "D2A/D2C": 1155, "D2B/D2D": 1225, "SKD": 1330, "SKP": 1750, "SXA": 2450}, "KGAOV": {"KGE": 70, "KGEOV": 140, "SKA": 840, "SKB": 910, "SKC": 980, "D2A/D2C": 1085, "D2B/D2D": 1155, "SKD": 1260, "SKP": 1680, "SXA": 2380}, "KGE": {"KGEOV": 70, "SKA": 770, "SKB": 840, "SKC": 910, "D2A/D2C": 1015, "D2B/D2D": 1085, "SKD": 1190, "SKP": 1610, "SXA": 2310}, "KGEOV": {"SKA": 700, "SKB": 770, "SKC": 840, "D2A/D2C": 945, "D2B/D2D": 1015, "SKD": 1120, "SKP": 1540, "SXA": 2240}, "SKA": {"SKB": 70, "SKC": 140, "SKD": 420, "SKP": 840, "SXA": 1540}, "SKB": {"SKC": 70, "SKD": 350, "SKP": 770, "SXA": 1470}, "SKC": {"SKD": 280, "SKP": 700, "SXA": 1400}, "D2A/D2C": {"D2B/D2D": 70, "SKD": 175, "SKP": 595, "SXA": 1295}, "D2B/D2D": {"SKD": 105, "SKP": 525, "SXA": 1225}, "SKD": {"SKP": 420, "SXA": 1120}, "SKP": {"SXA": 700}}}, {"key": "t3", "label": "Occupancy 50\u201370%", "extraPax": 485, "grid": {"KGA": {"KGAOV": 60, "KGE": 120, "KGEOV": 180, "SKA": 780, "SKB": 840, "SKC": 900, "D2A/D2C": 990, "D2B/D2D": 1050, "SKD": 1140, "SKP": 1500, "SXA": 2100}, "KGAOV": {"KGE": 60, "KGEOV": 120, "SKA": 720, "SKB": 780, "SKC": 840, "D2A/D2C": 930, "D2B/D2D": 990, "SKD": 1080, "SKP": 1440, "SXA": 2040}, "KGE": {"KGEOV": 60, "SKA": 660, "SKB": 720, "SKC": 780, "D2A/D2C": 870, "D2B/D2D": 930, "SKD": 1020, "SKP": 1380, "SXA": 1980}, "KGEOV": {"SKA": 600, "SKB": 660, "SKC": 720, "D2A/D2C": 810, "D2B/D2D": 870, "SKD": 960, "SKP": 1320, "SXA": 1920}, "SKA": {"SKB": 60, "SKC": 120, "SKD": 360, "SKP": 720, "SXA": 1320}, "SKB": {"SKC": 60, "SKD": 300, "SKP": 660, "SXA": 1260}, "SKC": {"SKD": 240, "SKP": 600, "SXA": 1200}, "D2A/D2C": {"D2B/D2D": 60, "SKD": 150, "SKP": 510, "SXA": 1110}, "D2B/D2D": {"SKD": 90, "SKP": 450, "SXA": 1050}, "SKD": {"SKP": 360, "SXA": 960}, "SKP": {"SXA": 600}}}, {"key": "t4", "label": "Occupancy <50% or 4+ Nights", "extraPax": 425, "grid": {"KGA": {"KGAOV": 50, "KGE": 100, "KGEOV": 150, "SKA": 650, "SKB": 700, "SKC": 750, "D2A/D2C": 825, "D2B/D2D": 875, "SKD": 950, "SKP": 1250, "SXA": 1750}, "KGAOV": {"KGE": 50, "KGEOV": 100, "SKA": 600, "SKB": 650, "SKC": 700, "D2A/D2C": 775, "D2B/D2D": 825, "SKD": 900, "SKP": 1200, "SXA": 1700}, "KGE": {"KGEOV": 50, "SKA": 550, "SKB": 600, "SKC": 650, "D2A/D2C": 725, "D2B/D2D": 775, "SKD": 850, "SKP": 1150, "SXA": 1650}, "KGEOV": {"SKA": 500, "SKB": 550, "SKC": 600, "D2A/D2C": 675, "D2B/D2D": 725, "SKD": 800, "SKP": 1100, "SXA": 1600}, "SKA": {"SKB": 50, "SKC": 100, "SKD": 300, "SKP": 600, "SXA": 1100}, "SKB": {"SKC": 50, "SKD": 250, "SKP": 550, "SXA": 1050}, "SKC": {"SKD": 200, "SKP": 500, "SXA": 1000}, "D2A/D2C": {"D2B/D2D": 50, "SKD": 125, "SKP": 425, "SXA": 925}, "D2B/D2D": {"SKD": 75, "SKP": 375, "SXA": 875}, "SKD": {"SKP": 300, "SXA": 800}, "SKP": {"SXA": 500}}}];

const LATE_CHECKOUT_DATA = [{"category": "Deluxe", "time": "16:00", "charges": 400, "room": 300, "fb": 100}, {"category": "Deluxe", "time": "18:00", "charges": 600, "room": 450, "fb": 150}, {"category": "Premium / Family Suite / Interconnecting", "time": "16:00", "charges": 600, "room": 450, "fb": 150}, {"category": "Premium / Family Suite / Interconnecting", "time": "18:00", "charges": 800, "room": 600, "fb": 200}, {"category": "All Suites", "time": "16:00", "charges": 750, "room": 562.5, "fb": 187.5}, {"category": "All Suites", "time": "18:00", "charges": 950, "room": 712.5, "fb": 237.5}];

const TYPE_DESC = {
  KGA: "Deluxe King Garden", KGAOV: "Deluxe King View", KGE: "Premium King Garden", KGEOV: "Premium King View",
  PI: "Posting Interface", SKA: "Kids Escape Suite", SKB: "Family Room Garden", SKC: "Family Room View",
  SKD: "Junior Suite", SKP: "Senior Suite", SXA: "King Suite", TWA: "Deluxe Twin Garden", TWAOV: "Deluxe Twin View",
};

const GLOSSARY = {
  BAL:    { label: "Balcony", conf: "high" },
  NBA:    { label: "No Balcony", conf: "high" },
  S:      { label: "Small Balcony", conf: "high" },
  KGB:    { label: "King Bed", conf: "high" },
  TWB:    { label: "Twin Bed", conf: "high" },
  BBE:    { label: "Bunk Bed", conf: "high" },
  SOF:    { label: "Sofa Cum Bed", conf: "high" },
  "1EXBED": { label: "1 Extra Bed Space in Room", conf: "high" },
  "2EXBED": { label: "2 Extra Bed Space in Room", conf: "high" },
  GAR:    { label: "Garden View", conf: "high" },
  GRD:    { label: "Ground Floor", conf: "high" },
  POO:    { label: "Pool View", conf: "high" },
  BEA:    { label: "Beach View", conf: "high" },
  ROA:    { label: "Road View", conf: "high" },
  CAV:    { label: "Car Park View", conf: "high" },
  MAN:    { label: "Main Entrance View", conf: "high" },
  COS:    { label: "Corniche Sea View", conf: "high" },
  TER:    { label: "Terrace", conf: "high" },
  NSM:    { label: "Non-Smoking", conf: "high" },
  HCA:    { label: "Disabled Room (Handicap Accessible)", conf: "high" },
  INT:    { label: "Interconnecting Room", conf: "high" },
  KTC:    { label: "Kitchenette", conf: "high" },
  COR:    { label: "Corner Room", conf: "high" },
  SA:     { label: "Small Room, No Extra Bed Space", conf: "high" },
  ZMR:    { label: "Zumroud (building reference)", conf: "high" },
  AMJ:    { label: "Amwaj (building reference)", conf: "high" },
  MRM:    { label: "Marmar (building reference)", conf: "high" },
  "1ST": { label: "First Floor", conf: "high" }, "2ND": { label: "Second Floor", conf: "high" },
  "3RD": { label: "Third Floor", conf: "high" }, "4TH": { label: "Fourth Floor", conf: "high" },
  "5TH": { label: "Fifth Floor", conf: "high" }, "6TH": { label: "Sixth Floor", conf: "high" },
  "7TH": { label: "Seventh Floor", conf: "high" }, "8TH": { label: "Eighth Floor", conf: "high" },
};

const LC_TYPE_TIER = {
  KGA: "Deluxe", KGAOV: "Deluxe", TWA: "Deluxe", TWAOV: "Deluxe",
  KGE: "Premium / Family Suite / Interconnecting", KGEOV: "Premium / Family Suite / Interconnecting",
  SKB: "Premium / Family Suite / Interconnecting", SKC: "Premium / Family Suite / Interconnecting",
  SKD: "All Suites", SKP: "All Suites", SXA: "All Suites", SKA: "All Suites",
};
