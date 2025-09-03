import { useState } from 'react';

export const useDeleteDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState(null);

  const openDialog = itemToDelete => {
    setItem(itemToDelete);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setItem(null);
  };

  return {
    isOpen,
    item,
    openDialog,
    closeDialog,
  };
};
