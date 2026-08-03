export type GrowthInputFieldKey =
  | 'height_cm'
  | 'weight_kg'
  | 'naked_vision_left'
  | 'naked_vision_right'
  | 'corrected_vision_left'
  | 'corrected_vision_right'
  | 'glasses_type'
  | 'lung_capacity_ml'
  | 'sprint_50m_seconds'
  | 'sit_and_reach_cm'
  | 'rope_skipping_1min_count'
  | 'sit_up_1min_count'
  | 'standing_long_jump_cm'
  | 'endurance_run_seconds'
  | 'health_conclusion';

export type GrowthFieldGroupKey = 'body_growth' | 'vision_health' | 'physical_fitness' | 'health_check';
export type GrowthFieldValueType = 'number' | 'text' | 'single-select';

export interface GrowthFieldDefinition {
  key: GrowthInputFieldKey;
  label: string;
  groupKey: GrowthFieldGroupKey;
  groupLabel: string;
  valueType: GrowthFieldValueType;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  decimalPlaces?: 0 | 1 | 2;
  options?: string[];
}

const field = (
  definition: GrowthFieldDefinition,
): GrowthFieldDefinition => definition;

export const PLATFORM_GROWTH_FIELD_CATALOG: GrowthFieldDefinition[] = [
  field({ key: 'height_cm', label: '身高', groupKey: 'body_growth', groupLabel: '身体成长', valueType: 'number', unit: '厘米', minValue: 50, maxValue: 250, decimalPlaces: 1 }),
  field({ key: 'weight_kg', label: '体重', groupKey: 'body_growth', groupLabel: '身体成长', valueType: 'number', unit: '千克', minValue: 10, maxValue: 250, decimalPlaces: 1 }),
  field({ key: 'naked_vision_left', label: '左眼裸眼视力', groupKey: 'vision_health', groupLabel: '视力健康', valueType: 'number', minValue: 3, maxValue: 5.3, decimalPlaces: 1 }),
  field({ key: 'naked_vision_right', label: '右眼裸眼视力', groupKey: 'vision_health', groupLabel: '视力健康', valueType: 'number', minValue: 3, maxValue: 5.3, decimalPlaces: 1 }),
  field({ key: 'corrected_vision_left', label: '左眼矫正视力', groupKey: 'vision_health', groupLabel: '视力健康', valueType: 'number', minValue: 3, maxValue: 5.3, decimalPlaces: 1 }),
  field({ key: 'corrected_vision_right', label: '右眼矫正视力', groupKey: 'vision_health', groupLabel: '视力健康', valueType: 'number', minValue: 3, maxValue: 5.3, decimalPlaces: 1 }),
  field({ key: 'glasses_type', label: '戴镜类型', groupKey: 'vision_health', groupLabel: '视力健康', valueType: 'single-select', options: ['不戴镜', '框架眼镜', '夜戴角膜塑形镜'] }),
  field({ key: 'lung_capacity_ml', label: '肺活量', groupKey: 'physical_fitness', groupLabel: '体能测试', valueType: 'number', unit: '毫升', minValue: 100, maxValue: 10000, decimalPlaces: 0 }),
  field({ key: 'sprint_50m_seconds', label: '50米跑', groupKey: 'physical_fitness', groupLabel: '体能测试', valueType: 'number', unit: '秒', minValue: 5, maxValue: 30, decimalPlaces: 2 }),
  field({ key: 'sit_and_reach_cm', label: '坐位体前屈', groupKey: 'physical_fitness', groupLabel: '体能测试', valueType: 'number', unit: '厘米', minValue: -30, maxValue: 40, decimalPlaces: 1 }),
  field({ key: 'rope_skipping_1min_count', label: '一分钟跳绳', groupKey: 'physical_fitness', groupLabel: '体能测试', valueType: 'number', unit: '次', minValue: 0, maxValue: 400, decimalPlaces: 0 }),
  field({ key: 'sit_up_1min_count', label: '一分钟仰卧起坐', groupKey: 'physical_fitness', groupLabel: '体能测试', valueType: 'number', unit: '次', minValue: 0, maxValue: 120, decimalPlaces: 0 }),
  field({ key: 'standing_long_jump_cm', label: '立定跳远', groupKey: 'physical_fitness', groupLabel: '体能测试', valueType: 'number', unit: '厘米', minValue: 20, maxValue: 350, decimalPlaces: 1 }),
  field({ key: 'endurance_run_seconds', label: '长跑成绩', groupKey: 'physical_fitness', groupLabel: '体能测试', valueType: 'number', unit: '秒', minValue: 30, maxValue: 1200, decimalPlaces: 1 }),
  field({ key: 'health_conclusion', label: '健康结论', groupKey: 'health_check', groupLabel: '健康检查', valueType: 'text' }),
];

export const GROWTH_FIELD_CONFIG_EVENT = 'school-growth-field-config-updated';
const STORAGE_PREFIX = 'school-enabled-growth-fields-v1';

const allFieldKeys = () => PLATFORM_GROWTH_FIELD_CATALOG.map(item => item.key);
const knownFieldKeys = new Set<GrowthInputFieldKey>(allFieldKeys());

export const getGrowthFieldDefinition = (key: GrowthInputFieldKey) => (
  PLATFORM_GROWTH_FIELD_CATALOG.find(item => item.key === key)
);

export const getGrowthFieldGroups = (fields: GrowthFieldDefinition[] = PLATFORM_GROWTH_FIELD_CATALOG) => {
  const groups = new Map<GrowthFieldGroupKey, { key: GrowthFieldGroupKey; label: string; fields: GrowthFieldDefinition[] }>();
  fields.forEach(item => {
    const group = groups.get(item.groupKey) ?? { key: item.groupKey, label: item.groupLabel, fields: [] };
    group.fields.push(item);
    groups.set(item.groupKey, group);
  });
  return Array.from(groups.values());
};

export const getEnabledGrowthFieldKeys = (spaceId: string): GrowthInputFieldKey[] => {
  if (typeof window === 'undefined') return allFieldKeys();
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${spaceId}`);
    if (!raw) return allFieldKeys();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return allFieldKeys();
    return parsed.filter((key): key is GrowthInputFieldKey => typeof key === 'string' && knownFieldKeys.has(key as GrowthInputFieldKey));
  } catch {
    return allFieldKeys();
  }
};

export const getEnabledGrowthFields = (spaceId: string) => {
  const enabled = new Set(getEnabledGrowthFieldKeys(spaceId));
  return PLATFORM_GROWTH_FIELD_CATALOG.filter(item => enabled.has(item.key));
};

export const setEnabledGrowthFieldKeys = (spaceId: string, keys: GrowthInputFieldKey[]) => {
  const normalized = PLATFORM_GROWTH_FIELD_CATALOG
    .map(item => item.key)
    .filter(key => keys.includes(key));
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(`${STORAGE_PREFIX}:${spaceId}`, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent(GROWTH_FIELD_CONFIG_EVENT, { detail: { spaceId } }));
  }
  return normalized;
};

export const formatGrowthFieldValue = (
  definition: GrowthFieldDefinition,
  value: string | number,
) => `${value}${definition.unit ?? ''}`;
