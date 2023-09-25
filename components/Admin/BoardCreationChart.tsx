import React from 'react';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTooltip } from 'victory';

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

interface BoardCreationChartProps {
  boardData: BoardData[];
}

const BoardCreationChart: React.FC<BoardCreationChartProps> = ({ boardData }) => {
  // Extract the creation dates and count them
  const creationDates = boardData.map((board) => new Date(board.created));
  const creationDatesCount = creationDates.reduce((acc, date) => {
    const formattedDate = date.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
    acc[formattedDate] = (acc[formattedDate] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // Format the data for VictoryLine
  const data = Object.keys(creationDatesCount).map((date) => ({
    x: new Date(date),
    y: creationDatesCount[date],
  }));

  return (
    <VictoryChart
      scale={{ x: 'time' }}
      width={600} // Adjust the width to fit your layout
      height={300} // Adjust the height to fit your layout
    >
      <VictoryAxis
        tickFormat={(tick) => new Date(tick).toLocaleDateString()}
        style={{
          tickLabels: { angle: 0, fontSize: 10 }, // Rotate and style x-axis labels
        }}
      />
      <VictoryAxis dependentAxis />
      <VictoryLine
        data={data}
        x="x"
        y="y"
        labels={({ datum }: { datum: { x: Date; y: number } }) =>
          `${datum.y} boards created on ${datum.x.toLocaleDateString()}`
        }
        labelComponent={<VictoryTooltip />}
      />
    </VictoryChart>
  );
};

export default BoardCreationChart;
