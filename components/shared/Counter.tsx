import React from 'react';

import { Button } from '../ui/button';

interface Props {
  className?: string;
  value: number;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
}

export const Counter: React.FC<Props> = ({ className, value = 1, onDecrement, onIncrement }) => {
  return (
    <div className='flex items-center'>
      <Button variant='default' onClick={() => onDecrement(1)} disabled={value <= 1}>
        -
      </Button>
      <p className='p-1.5 w-7.5 border border-primary rounded-xl text-center'>{value}</p>
      <Button variant='default' onClick={() => onIncrement(1)}>
        +
      </Button>
    </div>
  );
};
