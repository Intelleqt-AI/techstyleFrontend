declare module "react-modal" {
  import * as React from "react";
  interface ModalProps extends React.PropsWithChildren<any> {
    isOpen: boolean;
    onRequestClose?: () => void;
    contentLabel?: string;
    className?: string;
  }
  const Modal: React.FC<ModalProps>;
  export default Modal;
}
