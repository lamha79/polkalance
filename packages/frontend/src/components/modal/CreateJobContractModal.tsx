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
import CreateJobContractForm from '../form/CreateJobContractForm';
import { useResponsive } from '../hooks/useResponsive';

const CreateJobContractModal: FC = () => {
  const { createJobContractModalOpen, setCreateJobContractModalOpen, setCreateContractModalOpen } = useLanding();
  const {mobileDisplay , tabletDisplay, desktopDisplay} = useResponsive();

  const {
    disconnect
  } = useInkathon();

  const close = () => {
    // disconnect?.();
    setTimeout(() => {
      setCreateJobContractModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={createJobContractModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{base: 'full', md: "xl"}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Contract</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <CreateJobContractForm
              onSubmitSuccess={() => {
                // disconnect?.();
                setTimeout(() => {
                  setCreateJobContractModalOpen(false);
                  setCreateContractModalOpen(false);
                }, 200);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>}
    </>
  );
};

export default CreateJobContractModal;
