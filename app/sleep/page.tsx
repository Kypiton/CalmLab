import React from 'react';

interface Props {
  className?: string;
}

export default function Sleep({ className }: Props) {
  return <div className={className}>Sleep</div>;
}
