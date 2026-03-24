export interface MilestoneDefinition {
  id: string;
  label: string;
  description: string;
  icon: 'fire' | 'star' | 'trophy' | 'rocket' | 'heart';
  check: (data: { totalPublished: number; currentStreak: number }) => boolean;
}

export const MILESTONES: MilestoneDefinition[] = [
  { id: 'first_pub', label: 'Premiere publication', description: 'Ta premiere publication via le Hub', icon: 'rocket', check: d => d.totalPublished >= 1 },
  { id: 'pub_10', label: '10 publications', description: '10 publications via le Hub', icon: 'star', check: d => d.totalPublished >= 10 },
  { id: 'pub_25', label: '25 publications', description: '25 publications!', icon: 'trophy', check: d => d.totalPublished >= 25 },
  { id: 'streak_4', label: '4 semaines', description: '4 semaines consecutives de publication', icon: 'fire', check: d => d.currentStreak >= 4 },
  { id: 'streak_8', label: '8 semaines', description: '8 semaines consecutives!', icon: 'fire', check: d => d.currentStreak >= 8 },
];
