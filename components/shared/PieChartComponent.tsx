'use client';

import React from 'react';

import { PieChart } from '@mui/x-charts/PieChart';
import Stack from '@mui/material/Stack';

interface Props {
  className?: string;
  data: { label: string; value: number }[];
}

export const PieChartComponent: React.FC<Props> = ({ className, data }) => {
  const total = data.reduce((sum, item) => {
    return sum + item.value;
  }, 0);

  const chartData = data.map(item => {
    let color: string = 'oklch(54.1% 0.281 293.009)';

    if (item.label === 'Paid') color = 'oklch(54.1% 0.281 293.009)';
    if (item.label === 'Unpaid') color = 'oklch(64.6% 0.222 41.116)';
    if (item.label === 'No payment required') color = 'oklch(62.7% 0.194 149.214)';

    return {
      ...item,
      label: `${item.label} ${item.value} (${Math.round((item.value / total) * 100)}%)`,
      color,
    };
  });

  return (
    <Stack direction='row' sx={{ width: '100%', height: 300 }}>
      <PieChart
        series={[
          {
            paddingAngle: 6,
            innerRadius: '60%',
            outerRadius: '90%',
            data: chartData,
          },
        ]}
      />
    </Stack>
  );
};
