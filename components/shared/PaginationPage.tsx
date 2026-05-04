import React from 'react';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export const PaginationPage: React.FC<Props> = ({
  className,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  const pages: number[] = [];
  let pagesWithDots: (number | string)[] = [];

  switch (true) {
    case currentPage <= 3:
      pagesWithDots = [1, 2, 3, 'right-ellipsis', totalPages];
      break;
    case currentPage >= totalPages - 2:
      pagesWithDots = [1, 'left-ellipsis', totalPages - 2, totalPages - 1, totalPages];
      break;
    case currentPage >= 3 && currentPage < totalPages - 1:
      pagesWithDots = [
        1,
        'left-ellipsis',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        'right-ellipsis',
        totalPages,
      ];
      break;
  }

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  function prevPage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage => currentPage - 1);
    }
  }

  function presentPage(currentPage: number) {
    setCurrentPage(currentPage);
  }

  function nextPage() {
    if (currentPage !== totalPages) {
      setCurrentPage(currentPage => currentPage + 1);
    }
  }
  return (
    <Pagination className={cn('mt-4', className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href='#' onClick={prevPage} />
        </PaginationItem>
        {totalPages <= 5
          ? pages.map(page => (
              <PaginationItem key={page}>
                <PaginationLink
                  href='#'
                  onClick={() => presentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))
          : pagesWithDots.map(page => (
              <PaginationItem key={page}>
                {typeof page === 'number' ? (
                  <PaginationLink
                    href='#'
                    onClick={() => presentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
        <PaginationItem>
          <PaginationNext href='#' onClick={nextPage} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
