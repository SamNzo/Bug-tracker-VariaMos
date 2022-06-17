import CSS from 'csstype';

const colors = {
  low: '#00FF7F',
  medium: '#FFA500',
  high: '#FE010f',
  closed: '#008000',
  open: '#000080',
  closedBg: '#e2ffe2',
  openBg: '#e2e2ff',
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
