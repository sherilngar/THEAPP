import type { DepartmentId, Priority } from './types';

/**
 * The request catalogue (brief §6). Every entry is both a tappable option in the
 * guest services grid and something the concierge recognises in free text.
 */

export type ItemAction =
  | 'ticket'
  | 'menu'
  | 'restaurant'
  | 'spa'
  | 'transport'
  | 'handover'
  | 'status'
  | 'kb'
  | 'verify';

export type Sensitivity = 'medical' | 'security' | 'other_guest';

export interface CatalogueItem {
  key: string;
  en: string;
  ar: string;
  dept: DepartmentId;
  also?: DepartmentId;
  /** Free-text keywords, lower case. A `:2` suffix means the word implies a quantity (Arabic dual). */
  kw: string[];
  /** 'ask' = quantity is essential and we ask if missing; 'default' = assume 1. */
  qty?: 'ask' | 'default';
  /** Accepts a preferred time; 'ask' = time is essential. */
  time?: true | 'ask';
  prio?: Priority;
  action?: ItemAction;
  kb?: string;
  sensitive?: Sensitivity;
  /** Words in the same phrase that refine the details, e.g. "loud" → "Noisy". */
  hints?: Record<string, string>;
  /** Other items this one absorbs when both match in the same phrase. */
  absorbs?: string[];
  /** Extra context passed to the menu or booking card. */
  context?: string;
}

export interface CatalogueSection {
  id: string;
  en: string;
  ar: string;
  dept: DepartmentId;
  items: CatalogueItem[];
}

const AC_HINTS = {
  loud: 'Noisy',
  noisy: 'Noisy',
  noise: 'Noisy',
  rattling: 'Noisy',
  hot: 'Too hot',
  warm: 'Too hot',
  'not cooling': 'Too hot',
  cold: 'Too cold',
  freezing: 'Too cold',
  'صوت': 'Noisy',
  'إزعاج': 'Noisy',
  'ازعاج': 'Noisy',
  'حار': 'Too hot',
  'حر': 'Too hot',
  'بارد': 'Too cold',
  'برد': 'Too cold',
};

const CELEBRATION_HINTS = {
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  honeymoon: 'Honeymoon',
  'عيد ميلاد': 'Birthday',
  'ذكرى': 'Anniversary',
  'شهر العسل': 'Honeymoon',
};

export const CATALOGUE: CatalogueSection[] = [
  {
    id: 'frontoffice',
    en: 'Front Office & Ambassador',
    ar: 'المكتب الأمامي والسفير',
    dept: 'frontoffice',
    items: [
      { key: 'late_checkout', en: 'Late check-out', ar: 'تأخير المغادرة', dept: 'frontoffice', time: true, kw: ['late check-out', 'late checkout', 'late check out', 'check out later', 'checkout later', 'leave later', 'تأخير المغادرة', 'مغادرة متأخرة', 'تأخير الخروج'] },
      { key: 'early_checkin', en: 'Early check-in (future stay)', ar: 'تسجيل دخول مبكر لإقامة قادمة', dept: 'frontoffice', kw: ['early check-in', 'early checkin', 'early check in', 'arrive early', 'تسجيل دخول مبكر', 'وصول مبكر'] },
      { key: 'room_change', en: 'Room change', ar: 'تغيير الغرفة', dept: 'frontoffice', kw: ['change room', 'change my room', 'room change', 'move room', 'move rooms', 'different room', 'another room', 'تغيير الغرفة', 'غرفة أخرى', 'غرفة ثانية'] },
      { key: 'upgrade', en: 'Upgrade enquiry', ar: 'استفسار عن الترقية', dept: 'frontoffice', kw: ['upgrade', 'ترقية'] },
      { key: 'extend_stay', en: 'Extend stay', ar: 'تمديد الإقامة', dept: 'frontoffice', kw: ['extend my stay', 'extend stay', 'stay longer', 'extra night', 'another night', 'تمديد الإقامة', 'ليلة إضافية', 'تمديد'] },
      { key: 'view_bill', en: 'View bill', ar: 'عرض الفاتورة', dept: 'frontoffice', action: 'verify', kw: ['my bill', 'view bill', 'see my bill', 'folio', 'bill', 'الفاتورة', 'حسابي'] },
      { key: 'invoice_email', en: 'Invoice copy by email', ar: 'نسخة الفاتورة بالبريد', dept: 'frontoffice', action: 'verify', kw: ['invoice', 'receipt', 'email my bill', 'copy of my bill', 'فاتورة بالبريد', 'إيصال', 'ايصال'] },
      { key: 'wakeup', en: 'Wake-up call', ar: 'مكالمة إيقاظ', dept: 'frontoffice', time: 'ask', kw: ['wake-up call', 'wake up call', 'wakeup call', 'wake me', 'alarm call', 'مكالمة إيقاظ', 'إيقاظ', 'ايقاظ', 'صحيني'] },
      { key: 'message_guest', en: 'Message for another guest', ar: 'رسالة لنزيل آخر', dept: 'frontoffice', sensitive: 'other_guest', action: 'handover', kw: ['message for', 'leave a message', 'pass a message', 'another guest', 'other guest', 'رسالة لنزيل', 'نزيل آخر', 'نزيل اخر'] },
      { key: 'luggage', en: 'Luggage storage', ar: 'حفظ الأمتعة', dept: 'frontoffice', kw: ['luggage storage', 'store my luggage', 'store luggage', 'store my bags', 'keep my bags', 'تخزين الأمتعة', 'حفظ الحقائب', 'حفظ الأمتعة'] },
      { key: 'safe_deposit', en: 'Safe-deposit help', ar: 'صندوق الأمانات', dept: 'frontoffice', kw: ['safe deposit', 'safety deposit', 'صندوق الأمانات'] },
      { key: 'key_card', en: 'Key card / extra key', ar: 'بطاقة الغرفة / مفتاح إضافي', dept: 'frontoffice', kw: ['key card', 'keycard', 'room key', 'extra key', 'key not working', 'card not working', 'بطاقة الغرفة', 'مفتاح', 'المفتاح'] },
      { key: 'celebration', en: 'Celebration setup', ar: 'تجهيز احتفال', dept: 'frontoffice', hints: CELEBRATION_HINTS, kw: ['birthday', 'anniversary', 'honeymoon', 'celebration', 'celebrate', 'عيد ميلاد', 'ذكرى زواج', 'شهر العسل', 'احتفال'] },
      { key: 'feedback', en: 'Share feedback', ar: 'مشاركة ملاحظات', dept: 'frontoffice', kw: ['feedback', 'suggestion', 'ملاحظات', 'اقتراح'] },
      { key: 'ambassador', en: 'Speak to my ambassador', ar: 'التحدث إلى السفير', dept: 'frontoffice', action: 'handover', kw: ['ambassador', 'speak to someone', 'talk to someone', 'speak to a person', 'real person', 'a human', 'speak to a manager', 'السفير', 'موظف', 'شخص حقيقي', 'أكلم أحد', 'اكلم احد'] },
    ],
  },
  {
    id: 'concierge',
    en: 'Concierge & Transport',
    ar: 'الكونسيرج والمواصلات',
    dept: 'concierge',
    items: [
      { key: 'airport_transfer', en: 'Airport transfer', ar: 'توصيل من/إلى المطار', dept: 'concierge', action: 'transport', context: 'airport', kw: ['airport transfer', 'airport', 'المطار'] },
      { key: 'taxi', en: 'Taxi', ar: 'تاكسي', dept: 'concierge', action: 'transport', context: 'taxi', kw: ['taxi', 'cab', 'تاكسي', 'سيارة أجرة'] },
      { key: 'limousine', en: 'Limousine', ar: 'ليموزين', dept: 'concierge', action: 'transport', context: 'limousine', kw: ['limousine', 'limo', 'ليموزين'] },
      { key: 'car_rental', en: 'Car rental', ar: 'تأجير سيارة', dept: 'concierge', kw: ['car rental', 'rent a car', 'hire a car', 'rental car', 'تأجير سيارة', 'استئجار سيارة'] },
      { key: 'chauffeur', en: 'Chauffeur', ar: 'سائق خاص', dept: 'concierge', action: 'transport', context: 'chauffeur', kw: ['chauffeur', 'private driver', 'driver', 'سائق خاص', 'سائق'] },
      { key: 'tours', en: 'Local tours & excursions', ar: 'جولات ورحلات محلية', dept: 'concierge', kw: ['tour', 'tours', 'excursion', 'sightseeing', 'جولة', 'رحلة سياحية'] },
      { key: 'day_trip', en: 'Dubai or Abu Dhabi day trip', ar: 'رحلة يومية إلى دبي أو أبوظبي', dept: 'concierge', kw: ['day trip', 'dubai', 'abu dhabi', 'دبي', 'أبوظبي', 'أبو ظبي', 'ابوظبي'] },
      { key: 'safari', en: 'Desert safari', ar: 'سفاري صحراوي', dept: 'concierge', kw: ['desert safari', 'safari', 'dune bashing', 'سفاري', 'رحلة صحراوية'] },
      { key: 'attractions', en: 'Tickets & attractions', ar: 'تذاكر ومعالم', dept: 'concierge', kw: ['tickets', 'attraction', 'attractions', 'theme park', 'تذاكر'] },
      { key: 'ext_restaurant', en: 'Restaurant ideas outside the hotel', ar: 'اقتراح مطاعم خارج الفندق', dept: 'concierge', kw: ['restaurant outside', 'outside the hotel', 'restaurants in town', 'recommend a restaurant', 'مطعم خارج', 'مطاعم خارج'] },
      { key: 'flowers', en: 'Flower delivery', ar: 'توصيل الزهور', dept: 'concierge', kw: ['flowers', 'bouquet', 'flower delivery', 'ورد', 'زهور', 'باقة'] },
      { key: 'courier', en: 'Printing or courier', ar: 'طباعة أو شحن', dept: 'concierge', kw: ['courier', 'send a parcel', 'parcel', 'شحن', 'طرد'] },
      { key: 'directions', en: 'Directions', ar: 'الاتجاهات', dept: 'concierge', kw: ['directions', 'how do i get to', 'how to get to', 'الاتجاهات', 'كيف أصل', 'كيف اروح'] },
    ],
  },
  {
    id: 'housekeeping',
    en: 'Housekeeping',
    ar: 'التدبير المنزلي',
    dept: 'housekeeping',
    items: [
      { key: 'cleaning', en: 'Room cleaning', ar: 'تنظيف الغرفة', dept: 'housekeeping', time: true, kw: ['clean my room', 'room cleaning', 'clean the room', 'clean room', 'cleaning', 'make up my room', 'make up the room', 'service my room', 'housekeeping', 'تنظيف الغرفة', 'تنظيف', 'ترتيب الغرفة'] },
      { key: 'turndown', en: 'Turndown service', ar: 'خدمة تجهيز السرير المسائية', dept: 'housekeeping', time: true, kw: ['turndown', 'turn down', 'turn-down', 'خدمة المساء', 'تجهيز السرير'] },
      { key: 'makeup_later', en: 'Make up room later', ar: 'تنظيف الغرفة لاحقاً', dept: 'housekeeping', time: true, kw: ['clean later', 'make up the room later', 'make up room later', 'service later', 'come back later', 'تنظيف لاحقاً', 'تنظيف لاحقا', 'نظفوا لاحقا'] },
      { key: 'dnd', en: 'Do not disturb', ar: 'عدم الإزعاج', dept: 'housekeeping', kw: ['do not disturb', "don't disturb", 'dnd', 'عدم الإزعاج', 'عدم الازعاج', 'لا تزعج'] },
      { key: 'towels', en: 'Extra towels', ar: 'مناشف إضافية', dept: 'housekeeping', qty: 'ask', kw: ['towels', 'towel', 'مناشف', 'منشفة', 'فوط', 'فوطة', 'منشفتين:2', 'فوطتين:2'] },
      { key: 'robes', en: 'Bath robes', ar: 'أرواب الاستحمام', dept: 'housekeeping', qty: 'ask', kw: ['bathrobes', 'bathrobe', 'bath robes', 'bath robe', 'robes', 'robe', 'روب', 'أرواب', 'برنس'] },
      { key: 'slippers', en: 'Slippers', ar: 'خف', dept: 'housekeeping', qty: 'ask', kw: ['slippers', 'شبشب', 'خف', 'نعال'] },
      { key: 'pillows', en: 'Pillows (pillow menu)', ar: 'وسائد (قائمة الوسائد)', dept: 'housekeeping', qty: 'ask', kw: ['pillow menu', 'pillows', 'pillow', 'مخدات', 'مخدة', 'وسائد', 'وسادة', 'مخدتين:2', 'وسادتين:2'] },
      { key: 'blanket', en: 'Blanket', ar: 'بطانية', dept: 'housekeeping', qty: 'default', kw: ['blankets', 'blanket', 'بطانية', 'بطانيات', 'بطانيتين:2'] },
      { key: 'duvet', en: 'Duvet or linen change', ar: 'تغيير اللحاف أو الشراشف', dept: 'housekeeping', kw: ['duvet', 'change the sheets', 'change sheets', 'bed linen', 'لحاف', 'تغيير الشراشف', 'تغيير الملايات'] },
      { key: 'extra_bed', en: 'Extra bed', ar: 'سرير إضافي', dept: 'housekeeping', kw: ['extra bed', 'rollaway', 'سرير إضافي', 'سرير اضافي'] },
      { key: 'cot', en: 'Baby cot', ar: 'سرير أطفال', dept: 'housekeeping', kw: ['baby cot', 'cot', 'crib', 'سرير أطفال', 'سرير طفل', 'سرير اطفال'] },
      { key: 'baby_bath', en: 'Baby bath', ar: 'حوض استحمام للطفل', dept: 'housekeeping', kw: ['baby bath', 'حوض استحمام للطفل', 'بانيو أطفال'] },
      { key: 'bed_guard', en: 'Bed guard', ar: 'حاجز السرير', dept: 'housekeeping', kw: ['bed guard', 'bed rail', 'حاجز السرير'] },
      { key: 'shampoo', en: 'Shampoo refill', ar: 'شامبو', dept: 'housekeeping', qty: 'default', kw: ['shampoo', 'شامبو'] },
      { key: 'conditioner', en: 'Conditioner refill', ar: 'بلسم', dept: 'housekeeping', qty: 'default', kw: ['conditioner', 'بلسم'] },
      { key: 'body_lotion', en: 'Body lotion refill', ar: 'لوشن الجسم', dept: 'housekeeping', qty: 'default', kw: ['body lotion', 'lotion', 'لوشن'] },
      { key: 'dental_kit', en: 'Dental kit', ar: 'طقم أسنان', dept: 'housekeeping', qty: 'default', kw: ['dental kit', 'toothbrush', 'toothpaste', 'فرشاة أسنان', 'فرشاة اسنان', 'معجون'] },
      { key: 'shaving_kit', en: 'Shaving kit', ar: 'طقم حلاقة', dept: 'housekeeping', qty: 'default', kw: ['shaving kit', 'razor', 'أدوات حلاقة', 'ماكينة حلاقة', 'شفرة'] },
      { key: 'sewing_kit', en: 'Sewing kit', ar: 'طقم خياطة', dept: 'housekeeping', qty: 'default', kw: ['sewing kit', 'needle and thread', 'طقم خياطة', 'إبرة'] },
      { key: 'tissues', en: 'Tissues', ar: 'مناديل', dept: 'housekeeping', qty: 'default', kw: ['tissues', 'tissue', 'مناديل'] },
      { key: 'hangers', en: 'Hangers', ar: 'علّاقات ملابس', dept: 'housekeeping', qty: 'ask', kw: ['hangers', 'hanger', 'علاقات', 'شماعات', 'تعليقات'] },
      { key: 'iron', en: 'Iron & ironing board', ar: 'مكواة وطاولة كي', dept: 'housekeeping', kw: ['ironing board', 'an iron', 'iron', 'مكواة', 'طاولة كي'] },
      { key: 'kettle', en: 'Kettle or coffee capsules refill', ar: 'غلاية أو كبسولات قهوة', dept: 'housekeeping', kw: ['kettle', 'coffee capsules', 'capsules', 'coffee pods', 'tea bags', 'غلاية', 'كبسولات قهوة', 'كبسولات'] },
      { key: 'minibar_refill', en: 'Minibar refill', ar: 'تعبئة الميني بار', dept: 'housekeeping', kw: ['minibar refill', 'refill the minibar', 'restock the minibar', 'minibar', 'ميني بار', 'الميني بار'] },
      { key: 'water', en: 'Water bottles', ar: 'قناني مياه', dept: 'housekeeping', qty: 'ask', kw: ['water bottles', 'bottles of water', 'water bottle', 'water', 'مياه', 'ماء', 'مويه', 'قناني ماء'] },
      { key: 'beach_bag', en: 'Beach bag', ar: 'حقيبة شاطئ', dept: 'housekeeping', kw: ['beach bag', 'حقيبة شاطئ', 'شنطة بحر'] },
      { key: 'hypoallergenic', en: 'Hypoallergenic bedding', ar: 'مفارش مضادة للحساسية', dept: 'housekeeping', kw: ['hypoallergenic', 'anti-allergy', 'anti allergy', 'مضاد للحساسية', 'مضادة للحساسية'] },
      { key: 'remove_tray', en: 'Remove room-service tray', ar: 'إزالة صينية خدمة الغرف', dept: 'housekeeping', kw: ['remove the room-service tray', 'remove the room service tray'] },
      { key: 'lost_found', en: 'Lost and found', ar: 'المفقودات', dept: 'housekeeping', kw: ['lost and found', 'i lost', 'left behind', 'i forgot my', 'lost my', 'المفقودات', 'فقدت', 'نسيت'] },
    ],
  },
  {
    id: 'laundry',
    en: 'Laundry',
    ar: 'المغسلة',
    dept: 'laundry',
    items: [
      { key: 'laundry_pickup', en: 'Laundry pickup', ar: 'استلام الغسيل', dept: 'laundry', time: true, kw: ['laundry pickup', 'laundry', 'wash my clothes', 'washing', 'غسيل', 'مغسلة', 'الغسيل'] },
      { key: 'dry_cleaning', en: 'Dry cleaning', ar: 'تنظيف جاف', dept: 'laundry', kw: ['dry cleaning', 'dry clean', 'تنظيف جاف', 'دراي كلين'] },
      { key: 'pressing', en: 'Pressing', ar: 'كيّ الملابس', dept: 'laundry', kw: ['pressing', 'press my', 'iron my shirt', 'iron my clothes', 'كوي', 'كي الملابس', 'كي ملابس'] },
      { key: 'express_laundry', en: 'Express laundry', ar: 'غسيل سريع', dept: 'laundry', prio: 'high', kw: ['express laundry', 'express service', 'urgent laundry', 'غسيل سريع', 'غسيل مستعجل'] },
      { key: 'shoe_shine', en: 'Shoe shine', ar: 'تلميع الأحذية', dept: 'laundry', kw: ['shoe shine', 'shine my shoes', 'polish my shoes', 'تلميع الأحذية', 'تلميع الحذاء', 'تلميع الجزمة'] },
      { key: 'laundry_status', en: 'Laundry status', ar: 'حالة الغسيل', dept: 'laundry', kw: ['laundry status', 'where is my laundry', 'my laundry back', 'حالة الغسيل', 'وين غسيلي'] },
    ],
  },
  {
    id: 'engineering',
    en: 'Engineering',
    ar: 'الهندسة والصيانة',
    dept: 'engineering',
    items: [
      { key: 'ac', en: 'Air conditioning', ar: 'التكييف', dept: 'engineering', hints: AC_HINTS, absorbs: ['equip_noise'], kw: ['air conditioning', 'air-conditioning', 'air conditioner', 'air con', 'aircon', 'a/c', 'ac', 'thermostat', 'التكييف', 'المكيف', 'مكيف', 'تكييف'] },
      { key: 'tv', en: 'TV or remote', ar: 'التلفزيون أو جهاز التحكم', dept: 'engineering', kw: ['television', 'tv', 'remote', 'channels', 'التلفزيون', 'تلفزيون', 'الريموت', 'جهاز التحكم'] },
      { key: 'lights', en: 'Lights', ar: 'الإضاءة', dept: 'engineering', kw: ['lights', 'light', 'lamp', 'bulb', 'الإضاءة', 'الاضاءة', 'النور', 'اللمبة'] },
      { key: 'sockets', en: 'Power sockets', ar: 'مقابس الكهرباء', dept: 'engineering', kw: ['power socket', 'socket', 'power outlet', 'no power', 'electricity', 'الكهرباء', 'فيش', 'مقبس'] },
      { key: 'wifi_room', en: 'Wi-Fi in room', ar: 'الواي فاي في الغرفة', dept: 'engineering', also: 'it', kw: ['wi-fi', 'wifi', 'internet', 'واي فاي', 'الواي فاي', 'الانترنت', 'الإنترنت', 'النت'] },
      { key: 'water_heater', en: 'Water heater / no hot water', ar: 'سخان الماء', dept: 'engineering', kw: ['no hot water', 'hot water', 'water heater', 'water is cold', 'سخان', 'الماء الساخن', 'ماء حار', 'مويه حارة'] },
      { key: 'water_pressure', en: 'Low water pressure', ar: 'ضعف ضغط الماء', dept: 'engineering', kw: ['water pressure', 'low pressure', 'ضغط الماء', 'ضغط المويه'] },
      { key: 'leak', en: 'Leak', ar: 'تسريب', dept: 'engineering', prio: 'high', kw: ['leaking', 'leak', 'dripping', 'flooding', 'تسريب', 'تسرب', 'تنقيط'] },
      { key: 'drain', en: 'Blocked drain or toilet', ar: 'انسداد التصريف أو المرحاض', dept: 'engineering', prio: 'high', kw: ['blocked', 'clogged', 'drain', 'toilet', 'flush', 'انسداد', 'مسدود', 'المرحاض', 'السيفون'] },
      { key: 'shower', en: 'Shower', ar: 'الدش', dept: 'engineering', kw: ['shower', 'الدش', 'الدوش'] },
      { key: 'curtains', en: 'Curtains or blinds', ar: 'الستائر', dept: 'engineering', kw: ['curtains', 'curtain', 'blinds', 'الستائر', 'الستارة'] },
      { key: 'door_lock', en: 'Door or lock', ar: 'الباب أو القفل', dept: 'engineering', kw: ['door lock', 'door', 'lock', 'الباب', 'القفل'] },
      { key: 'safe', en: 'In-room safe', ar: 'خزنة الغرفة', dept: 'engineering', kw: ['the safe', 'safe', 'الخزنة', 'خزنة'] },
      { key: 'minibar_fridge', en: 'Minibar fridge not cold', ar: 'ثلاجة الميني بار لا تبرد', dept: 'engineering', kw: ['minibar not cold', 'minibar is not cold', 'fridge', 'refrigerator', 'الثلاجة'] },
      { key: 'balcony', en: 'Balcony door', ar: 'باب الشرفة', dept: 'engineering', kw: ['balcony door', 'balcony', 'الشرفة', 'البلكونة', 'البلكون'] },
      { key: 'equip_noise', en: 'Noise from equipment', ar: 'ضجيج من المعدات', dept: 'engineering', kw: ['noise', 'noisy', 'loud', 'humming', 'buzzing', 'rattling', 'ضجيج', 'إزعاج', 'طنين'] },
      { key: 'smell', en: 'Smell in room', ar: 'رائحة في الغرفة', dept: 'engineering', kw: ['smell', 'odour', 'odor', 'stinks', 'رائحة', 'ريحة'] },
      { key: 'insects', en: 'Insects', ar: 'حشرات', dept: 'engineering', also: 'housekeeping', prio: 'high', kw: ['insects', 'insect', 'bugs', 'bug', 'ants', 'cockroach', 'mosquito', 'mosquitoes', 'حشرات', 'حشرة', 'نمل', 'صرصور', 'بعوض'] },
    ],
  },
  {
    id: 'ird',
    en: 'In-Room Dining',
    ar: 'الطعام في الغرفة',
    dept: 'ird',
    items: [
      { key: 'ird_menu', en: 'Full menu', ar: 'القائمة الكاملة', dept: 'ird', action: 'menu', kw: ['in-room dining', 'room service', 'menu', 'order food', 'something to eat', 'hungry', 'المنيو', 'قائمة الطعام', 'خدمة الغرف', 'جوعان', 'أكل'] },
      { key: 'breakfast_preorder', en: 'Breakfast pre-order for tomorrow', ar: 'طلب فطور مسبق للغد', dept: 'ird', action: 'menu', context: 'breakfast', kw: ['breakfast tomorrow', 'pre-order breakfast', 'preorder breakfast', 'breakfast in my room', 'breakfast in the room', 'فطور بكرة', 'فطور غدا', 'الفطور في الغرفة'] },
      { key: 'kids_menu', en: "Kids' menu", ar: 'قائمة الأطفال', dept: 'ird', action: 'menu', context: 'kids', kw: ["kids' menu", 'kids menu', "children's menu", 'menu for kids', 'قائمة الأطفال', 'منيو الأطفال'] },
      { key: 'dietary', en: 'Dietary filters', ar: 'خيارات غذائية', dept: 'ird', action: 'menu', context: 'dietary', kw: ['vegetarian', 'vegan', 'gluten free', 'gluten-free', 'dairy free', 'dairy-free', 'nut free', 'halal', 'نباتي', 'خالي من الغلوتين', 'حلال'] },
      { key: 'allergy', en: 'Allergy information', ar: 'معلومات الحساسية', dept: 'ird', action: 'menu', context: 'allergy', kw: ['allergy', 'allergic', 'حساسية'] },
      { key: 'cutlery', en: 'Cutlery or condiments', ar: 'أدوات المائدة أو الصلصات', dept: 'ird', kw: ['cutlery', 'condiments', 'ketchup', 'napkins', 'أدوات المائدة', 'ملاعق', 'كاتشب'] },
      { key: 'ice_bucket', en: 'Ice bucket', ar: 'دلو ثلج', dept: 'ird', kw: ['ice bucket', 'ice', 'ثلج'] },
      { key: 'bottle_service', en: 'Wine & bottle service (where permitted)', ar: 'خدمة المشروبات (حيث يسمح)', dept: 'ird', kw: ['bottle service', 'champagne', 'wine'] },
      { key: 'occasion_cake', en: 'Special-occasion cake', ar: 'كعكة لمناسبة خاصة', dept: 'ird', hints: CELEBRATION_HINTS, absorbs: ['celebration'], kw: ['birthday cake', 'anniversary cake', 'cake', 'كيكة', 'كعكة', 'تورتة'] },
      { key: 'order_status', en: 'Order status', ar: 'حالة الطلب', dept: 'ird', action: 'status', kw: ['order status', 'where is my order', 'where is my food', 'my order', 'وين الأكل', 'حالة الطلب', 'وين طلبي'] },
      { key: 'collect_tray', en: 'Collect tray', ar: 'استلام الصينية', dept: 'ird', kw: ['collect the tray', 'collect tray', 'remove tray', 'tray', 'الصينية', 'صينية'] },
    ],
  },
  {
    id: 'restaurants',
    en: 'Restaurants & Bars',
    ar: 'المطاعم والمقاهي',
    dept: 'restaurants',
    items: [
      { key: 'book_table', en: 'Book a table', ar: 'حجز طاولة', dept: 'restaurants', action: 'restaurant', kw: ['book a table', 'table for', 'table at', 'book dinner', 'book lunch', 'dinner reservation', 'dinner', 'lunch', 'حجز طاولة', 'طاولة', 'عشاء', 'غداء'] },
      { key: 'change_booking', en: 'Change or cancel a booking', ar: 'تعديل أو إلغاء حجز', dept: 'restaurants', kw: ['change my booking', 'change my reservation', 'move my reservation', 'تعديل الحجز', 'تغيير الحجز'] },
      { key: 'outlet_info', en: 'Menus & opening hours', ar: 'القوائم وساعات العمل', dept: 'restaurants', action: 'kb', kb: 'outlets', kw: ['restaurants', 'opening hours', 'المطاعم', 'ساعات العمل'] },
      { key: 'dress_code', en: 'Dress code', ar: 'قواعد اللباس', dept: 'restaurants', action: 'kb', kb: 'dress_code', kw: ['dress code', 'what to wear', 'قواعد اللباس', 'اللبس'] },
      { key: 'private_dining', en: 'Private dining', ar: 'عشاء خاص', dept: 'restaurants', kw: ['private dining', 'private dinner', 'عشاء خاص'] },
      { key: 'beach_table', en: 'Beach or terrace table', ar: 'طاولة على الشاطئ أو التراس', dept: 'restaurants', action: 'restaurant', context: 'beach or terrace table', kw: ['beach table', 'terrace table', 'table by the beach', 'table on the terrace', 'طاولة على الشاطئ', 'طاولة على التراس'] },
      { key: 'occasion_setup', en: 'Special occasion setup', ar: 'تجهيز مناسبة خاصة', dept: 'restaurants', kw: ['occasion setup', 'decorate the table', 'تزيين الطاولة'] },
    ],
  },
  {
    id: 'spa',
    en: 'Spa & Wellness',
    ar: 'السبا والعافية',
    dept: 'spa',
    items: [
      { key: 'spa_book', en: 'Book a treatment', ar: 'حجز علاج', dept: 'spa', action: 'spa', kw: ['spa', 'massage', 'treatment', 'facial', 'سبا', 'مساج', 'تدليك', 'جلسة'] },
      { key: 'couples', en: 'Couples treatment', ar: 'علاج للزوجين', dept: 'spa', action: 'spa', context: 'couples', absorbs: ['spa_book'], kw: ['couples massage', 'couples treatment', 'couple massage', 'مساج للزوجين'] },
      { key: 'in_room_massage', en: 'In-room massage (where offered)', ar: 'مساج في الغرفة (حسب التوفر)', dept: 'spa', absorbs: ['spa_book'], kw: ['in-room massage', 'massage in my room', 'massage in the room', 'مساج في الغرفة'] },
      { key: 'gym', en: 'Gym & class schedule', ar: 'النادي الرياضي والحصص', dept: 'spa', action: 'kb', kb: 'gym', kw: ['gym', 'fitness', 'class schedule', 'yoga', 'الجيم', 'النادي الرياضي', 'يوغا'] },
      { key: 'trainer', en: 'Personal trainer', ar: 'مدرب شخصي', dept: 'spa', kw: ['personal trainer', 'trainer', 'مدرب شخصي', 'مدرب'] },
      { key: 'sauna', en: 'Sauna & steam hours', ar: 'ساعات الساونا والبخار', dept: 'spa', action: 'kb', kb: 'sauna', kw: ['sauna', 'steam room', 'steam', 'الساونا', 'ساونا', 'البخار'] },
      { key: 'spa_change', en: 'Change or cancel a spa booking', ar: 'تعديل أو إلغاء حجز السبا', dept: 'spa', absorbs: ['spa_book'], kw: ['change my spa', 'move my spa', 'change my massage', 'تغيير موعد السبا'] },
    ],
  },
  {
    id: 'recreation',
    en: 'Recreation, Beach & Kids',
    ar: 'الترفيه والشاطئ والأطفال',
    dept: 'recreation',
    items: [
      { key: 'pool_hours', en: 'Pool & beach hours', ar: 'ساعات المسبح والشاطئ', dept: 'recreation', action: 'kb', kb: 'pool', kw: ['pool hours', 'beach hours', 'pool', 'beach', 'المسبح', 'الشاطئ', 'البحر'] },
      { key: 'cabana', en: 'Cabana or daybed', ar: 'كابانا أو سرير شمسي', dept: 'recreation', time: true, absorbs: ['pool_hours'], kw: ['cabana', 'daybed', 'day bed', 'sunbed', 'sun lounger', 'كابانا', 'سرير شمسي'] },
      { key: 'pool_towels', en: 'Towels at the pool', ar: 'مناشف عند المسبح', dept: 'recreation', qty: 'ask', absorbs: ['pool_hours', 'towels'], kw: ['pool towels', 'towels at the pool', 'beach towels', 'towels to the pool', 'مناشف المسبح', 'مناشف الشاطئ'] },
      { key: 'water_sports', en: 'Water sports', ar: 'الرياضات المائية', dept: 'recreation', kw: ['water sports', 'jet ski', 'kayak', 'paddle board', 'snorkelling', 'snorkeling', 'الرياضات المائية', 'جت سكي', 'كاياك'] },
      { key: 'kids_club', en: "Kids' club registration", ar: 'التسجيل في نادي الأطفال', dept: 'recreation', kw: ["kids' club", 'kids club', "children's club", 'نادي الأطفال', 'نادي الاطفال'] },
      { key: 'babysitting', en: 'Babysitting request', ar: 'طلب جليسة أطفال', dept: 'recreation', time: 'ask', kw: ['babysitter', 'babysitting', 'nanny', 'جليسة أطفال', 'جليسة اطفال', 'مربية'] },
      { key: 'activities', en: 'Activity schedule', ar: 'برنامج الأنشطة', dept: 'recreation', action: 'kb', kb: 'activities', kw: ['activity schedule', 'activities', "what's on", 'الأنشطة', 'الانشطة', 'برنامج الأنشطة'] },
    ],
  },
  {
    id: 'security',
    en: 'Security',
    ar: 'الأمن',
    dept: 'security',
    items: [
      { key: 'unsafe', en: 'I feel unsafe', ar: 'لا أشعر بالأمان', dept: 'security', prio: 'urgent', sensitive: 'security', action: 'handover', kw: ['unsafe', 'not safe', "don't feel safe", 'scared', 'afraid', 'threatened', 'غير آمن', 'خائف', 'خايف', 'بعدم الأمان'] },
      { key: 'suspicious', en: 'Suspicious activity', ar: 'نشاط مشبوه', dept: 'security', prio: 'urgent', sensitive: 'security', action: 'handover', kw: ['suspicious', 'someone is following', 'strange person', 'stranger in', 'مشبوه', 'شخص غريب'] },
      { key: 'lost_value', en: 'Lost item of value', ar: 'فقدان غرض ثمين', dept: 'security', prio: 'high', sensitive: 'security', action: 'handover', absorbs: ['lost_found'], kw: ['lost my wallet', 'lost my passport', 'lost my phone', 'lost my watch', 'lost my jewellery', 'lost my jewelry', 'lost my ring', 'stolen', 'theft', 'missing money', 'سرقة', 'مسروق', 'فقدت محفظتي', 'فقدت جوازي', 'ضاع جوالي', 'سرق'] },
      { key: 'safe_lockout', en: 'Safe lockout', ar: 'الخزنة مقفلة', dept: 'security', prio: 'high', sensitive: 'security', action: 'handover', absorbs: ['safe'], kw: ['locked out of my safe', 'safe is locked', "safe won't open", 'safe will not open', 'cannot open the safe', "can't open the safe", 'الخزنة مقفلة', 'الخزنة ما تفتح'] },
    ],
  },
  {
    id: 'it',
    en: 'IT & AV',
    ar: 'تقنية المعلومات',
    dept: 'it',
    items: [
      { key: 'wifi_help', en: 'Wi-Fi help', ar: 'مساعدة الواي فاي', dept: 'it', action: 'kb', kb: 'wifi', kw: ['wifi password', 'wi-fi password', 'connect to wifi', 'connect to the wifi', 'كلمة سر الواي فاي', 'باسورد الواي فاي'] },
      { key: 'casting', en: 'Cast my device to the TV', ar: 'عرض الجهاز على التلفزيون', dept: 'it', absorbs: ['tv'], kw: ['screen mirroring', 'mirror my phone', 'chromecast', 'airplay', 'casting', 'cast', 'stream to the tv', 'عرض الشاشة', 'بث'] },
      { key: 'adapters', en: 'Adapters & chargers', ar: 'محولات وشواحن', dept: 'it', qty: 'default', kw: ['adapter', 'adaptor', 'charger', 'charging cable', 'usb cable', 'محول', 'شاحن'] },
      { key: 'printing', en: 'Printing', ar: 'طباعة', dept: 'it', kw: ['boarding pass', 'printing', 'printer', 'print', 'طباعة', 'طابعة', 'اطبع'] },
    ],
  },
  {
    id: 'events',
    en: 'Events & Business',
    ar: 'الفعاليات والأعمال',
    dept: 'concierge',
    items: [
      { key: 'meeting_room', en: 'Meeting room booking', ar: 'حجز قاعة اجتماعات', dept: 'concierge', time: true, kw: ['meeting room', 'conference room', 'boardroom', 'قاعة اجتماعات', 'غرفة اجتماعات'] },
      { key: 'business', en: 'Business services', ar: 'خدمات الأعمال', dept: 'concierge', kw: ['business services', 'business centre', 'business center', 'scan a document', 'مركز الأعمال', 'خدمات الأعمال'] },
    ],
  },
  {
    id: 'medical',
    en: 'Medical',
    ar: 'الخدمات الطبية',
    dept: 'frontoffice',
    items: [
      { key: 'doctor', en: 'Doctor on call', ar: 'طبيب عند الطلب', dept: 'frontoffice', also: 'dutymanager', prio: 'urgent', sensitive: 'medical', action: 'handover', kw: ['doctor', 'medical', 'feel sick', 'i am sick', "i'm sick", 'unwell', 'fever', 'دكتور', 'طبيب', 'مريض', 'تعبان', 'حرارة'] },
      { key: 'pharmacy', en: 'Pharmacy request', ar: 'طلب من الصيدلية', dept: 'frontoffice', also: 'dutymanager', prio: 'high', sensitive: 'medical', action: 'handover', kw: ['pharmacy', 'medicine', 'medication', 'paracetamol', 'painkiller', 'صيدلية', 'دواء', 'بنادول'] },
      { key: 'first_aid', en: 'First aid', ar: 'إسعافات أولية', dept: 'security', also: 'dutymanager', prio: 'urgent', sensitive: 'medical', action: 'handover', kw: ['first aid', 'injured', 'i cut myself', 'bleeding', 'i fell', 'إسعافات', 'اسعافات', 'نزيف', 'جرح', 'انجرحت'] },
    ],
  },
];

export const ALL_ITEMS: CatalogueItem[] = CATALOGUE.flatMap((s) => s.items);
export const ITEM_BY_KEY: Record<string, CatalogueItem> = Object.fromEntries(
  ALL_ITEMS.map((i) => [i.key, i]),
);

export function sectionOf(key: string): CatalogueSection | undefined {
  return CATALOGUE.find((s) => s.items.some((i) => i.key === key));
}
