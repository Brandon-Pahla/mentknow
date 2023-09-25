import React from 'react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip } from 'victory';

interface BoardData {
  id: string;
  created: string;
  lastConnection: string;
  type: string;
  name: string;
  owner: string;
  draft: boolean;
  accesses: {
    default: string;
    groups: { [key: string]: string };
    users: { [key: string]: string };
  };
}

interface BoardUserChartProps {
  boardData: BoardData[];
}

const truncateLabel = (label: string) => {
  if (label.length > 6) {
    return label.slice(0, 6) + '...';
  }
  return label;
};

const BoardUserChart: React.FC<BoardUserChartProps> = ({ boardData }) => {
  const boardUsersData = boardData.map((board) => ({
    boardName: truncateLabel(board.name),
    usersCount: Object.keys(board.accesses.users).length,
    fullLabel: board.name,
  }));

  const maxTooltipWidth = Math.max(
    ...boardUsersData.map((data) => data.fullLabel.length)
  );
  const tooltipWidth = maxTooltipWidth * 8 + 40; // Adjust this value as needed

  return (
    <VictoryChart
      domainPadding={{ x: 40 }}
      height={300}
      width={600}
      // style={{ background: '#f5f5f5', padding: 20, borderRadius: 5 }}
    >
      <VictoryAxis
        tickFormat={(tick) => tick}
        style={{
          axis: { stroke: 'none' },
          ticks: { size: 0 },
          tickLabels: { fontSize: 12, angle: 0, padding: 10 },
        }}
      />
      <VictoryAxis
        dependentAxis
        tickFormat={(tick) => `${tick}`}
        style={{
          axis: { stroke: 'none' },
          ticks: { size: 0 },
          tickLabels: { fontSize: 12 },
        }}
      />
      <VictoryBar
        data={boardUsersData}
        x="boardName"
        y="usersCount"
        labelComponent={
          <VictoryTooltip
            style={{ fontSize: 11 }}
            cornerRadius={5}
            flyoutStyle={{
              fill: '#fbcfe8',
              stroke: 'none',
              padding: 2,
              width: tooltipWidth,
            }}
            // flyoutHeight={60} // You can set a fixed height or leave it as needed
            renderInPortal
          />
        }
        labels={({ datum }) => `${datum.fullLabel}: ${datum.usersCount} users`}
        style={{
          data: {
            fill: '#831843',
            width: 20,
            // borderRadius: 20,
          },
        }}
      />
    </VictoryChart>
  );
};

export default BoardUserChart;
