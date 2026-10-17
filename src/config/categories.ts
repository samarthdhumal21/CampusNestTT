export type CollegeCategoryId =
  | 'engineering'
  | 'medical'
  | 'pharmacy'
  | 'arts-science-commerce'
  | 'law'
  | 'management'
  | 'agriculture'
  | 'diploma';

export interface CollegeCategoryConfig {
  id: CollegeCategoryId;
  label: string;
  shortLabel?: string;
  icon: string; // Lucide icon identifier name
  order: number;
  description: string;
}

export const COLLEGE_CATEGORIES: CollegeCategoryConfig[] = [
  {
    id: 'engineering',
    label: 'Engineering',
    shortLabel: 'Engg',
    icon: 'Cpu',
    order: 1,
    description: 'Autonomous & university engineering institutes, B.Tech and M.Tech campuses'
  },
  {
    id: 'medical',
    label: 'Medical',
    shortLabel: 'Medical',
    icon: 'Stethoscope',
    order: 2,
    description: 'Government medical colleges, private medical institutes & nursing campuses'
  },
  {
    id: 'pharmacy',
    label: 'Pharmacy',
    shortLabel: 'Pharmacy',
    icon: 'Pill',
    order: 3,
    description: 'Pharmaceutical sciences, D.Pharm and B.Pharm institutes'
  },
  {
    id: 'arts-science-commerce',
    label: 'Arts / Science / Commerce',
    shortLabel: 'Arts & Sci',
    icon: 'BookOpen',
    order: 4,
    description: 'Traditional universities, autonomous degree colleges, BA, B.Sc & B.Com'
  },
  {
    id: 'law',
    label: 'Law',
    shortLabel: 'Law',
    icon: 'Scale',
    order: 5,
    description: 'Law colleges, LLB, BA LLB, and university law departments'
  },
  {
    id: 'management',
    label: 'Management',
    shortLabel: 'Management',
    icon: 'Briefcase',
    order: 6,
    description: 'Business schools, MBA, MCA, and management research institutes'
  },
  {
    id: 'agriculture',
    label: 'Agriculture',
    shortLabel: 'Agri',
    icon: 'Sprout',
    order: 7,
    description: 'Agricultural degree campuses & state agricultural research centers'
  },
  {
    id: 'diploma',
    label: 'Diploma',
    shortLabel: 'Diploma',
    icon: 'Award',
    order: 8,
    description: 'Government and private polytechnic diploma institutes'
  }
];

export const CATEGORY_MAP = new Map<CollegeCategoryId, CollegeCategoryConfig>(
  COLLEGE_CATEGORIES.map(c => [c.id, c])
);

export function getCategoryConfig(categoryId: string): CollegeCategoryConfig | undefined {
  return CATEGORY_MAP.get(categoryId as CollegeCategoryId);
}
