import CSS from 'csstype';
import { Category } from '../redux/types';

const colors = {
  low: '#00FF7F',
  medium: '#FFA500',
  high: '#FE010f',
  closed: '#008000',
  open: '#000080',
  closedBg: '#e2ffe2',
  openBg: '#e2e2ff',
  enhancement: '#000099',
  bug: '#FFFFFF',
  question: '#000000',
  enhancementBg: '#CCFFFF',
  bugBg: '#FF9999',
  questionBg: '#FFCCFF'
};

export const priorityStyles = (
  priority: 'low' | 'medium' | 'high'
): CSS.Properties => {
  return {
    color: priority === 'low' ? '#fff' : '#fff',
    backgroundColor: colors[priority],
    borderRadius: '4px',
    fontWeight: 500,
    padding: '0.35em',
    maxWidth: '4em',
  };
};

export const statusStyles = (isResolved: boolean): CSS.Properties => {
  const color = isResolved ? colors.closed : colors.open;
  const backgroundColor = isResolved ? colors.closedBg : colors.openBg;
  return {
    color,
    backgroundColor,
    borderRadius: '4px',
    fontWeight: 500,
    padding: '0.35em',
    maxWidth: '4em',
  };
};

export const categoryStyles = (category: Category): CSS.Properties => {
  if (category) {
    const categoryName = category.name;
    const color = categoryName === 'Question' ? colors.question : categoryName === 'Enhancement' ? colors.enhancement : colors.bug;
    const backgroundColor = categoryName === 'Question' ? colors.questionBg : categoryName === 'Enhancement' ? colors.enhancementBg : (categoryName === '' || category === null) ? colors.bug : colors.bugBg;
    return {
      color,
      backgroundColor,
      borderRadius: '4px',
      fontWeight: 500,
      padding: '0.35em',
      maxWidth: '14em',
    };
  }
  else {
    const color = colors.bug;
    const backgroundColor = colors.bugBg;
    return {
      color,
      backgroundColor,
      borderRadius: '4px',
      fontWeight: 500,
      padding: '0.35em',
      maxWidth: '14em',
    };
    }
  
}

