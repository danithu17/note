import React from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

/**
 * ModalPortal attaches modal overlays directly to document.body.
 * This prevents CSS transform, filter, or backdrop-filter on ancestor elements
 * (like <header> or <aside>) from creating containing blocks that trap or offset
 * fixed-position modal dialogs.
 */
export const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(children, document.body);
};
