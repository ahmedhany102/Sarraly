/**
 * Egyptian Governorates list for shipping zones
 * Official 27 governorates of Egypt
 */
export const EGYPTIAN_GOVERNORATES = [
    { value: 'cairo', label: 'القاهرة', labelEn: 'Cairo' },
    { value: 'giza', label: 'الجيزة', labelEn: 'Giza' },
    { value: 'alexandria', label: 'الإسكندرية', labelEn: 'Alexandria' },
    { value: 'dakahlia', label: 'الدقهلية', labelEn: 'Dakahlia' },
    { value: 'sharqia', label: 'الشرقية', labelEn: 'Sharqia' },
    { value: 'qalyubia', label: 'القليوبية', labelEn: 'Qalyubia' },
    { value: 'monufia', label: 'المنوفية', labelEn: 'Monufia' },
    { value: 'gharbia', label: 'الغربية', labelEn: 'Gharbia' },
    { value: 'kafr_el_sheikh', label: 'كفر الشيخ', labelEn: 'Kafr El Sheikh' },
    { value: 'beheira', label: 'البحيرة', labelEn: 'Beheira' },
    { value: 'damietta', label: 'دمياط', labelEn: 'Damietta' },
    { value: 'port_said', label: 'بورسعيد', labelEn: 'Port Said' },
    { value: 'ismailia', label: 'الإسماعيلية', labelEn: 'Ismailia' },
    { value: 'suez', label: 'السويس', labelEn: 'Suez' },
    { value: 'north_sinai', label: 'شمال سيناء', labelEn: 'North Sinai' },
    { value: 'south_sinai', label: 'جنوب سيناء', labelEn: 'South Sinai' },
    { value: 'red_sea', label: 'البحر الأحمر', labelEn: 'Red Sea' },
    { value: 'fayoum', label: 'الفيوم', labelEn: 'Fayoum' },
    { value: 'beni_suef', label: 'بني سويف', labelEn: 'Beni Suef' },
    { value: 'minya', label: 'المنيا', labelEn: 'Minya' },
    { value: 'asyut', label: 'أسيوط', labelEn: 'Asyut' },
    { value: 'sohag', label: 'سوهاج', labelEn: 'Sohag' },
    { value: 'qena', label: 'قنا', labelEn: 'Qena' },
    { value: 'luxor', label: 'الأقصر', labelEn: 'Luxor' },
    { value: 'aswan', label: 'أسوان', labelEn: 'Aswan' },
    { value: 'new_valley', label: 'الوادي الجديد', labelEn: 'New Valley' },
    { value: 'matrouh', label: 'مطروح', labelEn: 'Matrouh' },
] as const;

export type Governorate = typeof EGYPTIAN_GOVERNORATES[number]['value'];

export function getGovernorateLabel(value: string): string {
    const gov = EGYPTIAN_GOVERNORATES.find(g => g.value === value);
    return gov?.label || value;
}

export function getGovernorateEnLabel(value: string): string {
    const gov = EGYPTIAN_GOVERNORATES.find(g => g.value === value);
    return gov?.labelEn || value;
}
