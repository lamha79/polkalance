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
import SignAndObtainForm from '@components/form/SignAndObtain';
import { useResponsive } from '../hooks/useResponsive';

const SignAndObtainModal: FC = () => {
  const { signAndObtainModalOpen, setSignAndObtainModalOpen } = useLanding();
  const {mobileDisplay , tabletDisplay, desktopDisplay} = useResponsive();

  // const {
  //   disconnect
  // } = useInkathon();

  const close = () => {
    // disconnect?.();
    setTimeout(() => {
      setSignAndObtainModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={signAndObtainModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{base: 'full', md: "xl"}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Contract Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <SignAndObtainForm
              onSubmitSuccess={() => {
                // disconnect?.();
                setTimeout(() => {
                  setSignAndObtainModalOpen(false);
                }, 200);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>}
    </>
  );
};

export default SignAndObtainModal;
