import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react';
import { useInkathon } from '@scio-labs/use-inkathon'
import { useLanding } from '../../front-provider/src'
import { FC } from 'react';
import CreateContractForm from '../form/CreateContractForm';
import { useResponsive } from '../hooks/useResponsive';

const CreateContractModal: FC = () => {
  const { createContractModalOpen, setCreateContractModalOpen } = useLanding();
  const {mobileDisplay , tabletDisplay, desktopDisplay} = useResponsive();

  const {
    disconnect
  } = useInkathon();

  const close = () => {
    // disconnect?.();
    setTimeout(() => {
      setCreateContractModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={createContractModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{base: 'full', md: "xl"}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Auctioneers</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <CreateContractForm
              // onSubmitSuccess={() => {
              //   // disconnect?.();
              //   setTimeout(() => {
              //     setCreateContractModalOpen(false);
              //   }, 200);
              // }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>}
    </>
  );
};

export default CreateContractModal;
