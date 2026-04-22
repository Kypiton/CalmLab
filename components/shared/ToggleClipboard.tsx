'use client';

import React from 'react';

import { Clipboard, ClipboardCheck } from 'lucide-react';

interface Props {
  sessionId: string;
}

export const ToggleClipboard: React.FC<Props> = ({ sessionId }) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const copyText = async () => {
    await navigator.clipboard.writeText(sessionId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return isCopied ? (
    <ClipboardCheck className='cursor-pointer' />
  ) : (
    <Clipboard className='cursor-pointer' onClick={copyText} />
  );
};
