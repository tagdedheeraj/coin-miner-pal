
export const getPlanBorderColor = (color: string): string => {
  switch(color) {
    case 'blue': return '#3B82F6';
    case 'green': return '#10B981';
    case 'purple': return '#8B5CF6';
    case 'red': return '#EF4444';
    case 'cyan': return '#06B6D4';
    case 'amber': return '#F59E0B';
    case 'gold': return '#EAB308';
    case 'pink': return '#EC4899';
    default: return '#6B7280';
  }
};
