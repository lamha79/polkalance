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
import SubmitForm from '../form/SubmitForm';
import { useResponsive } from '../hooks/useResponsive';

const SubmitModal: FC = () => {
  const { submitModalOpen, setSubmitModalOpen } = useLanding();
  const {mobileDisplay , tabletDisplay, desktopDisplay} = useResponsive();

  const {
    disconnect
  } = useInkathon();

  const close = () => {
    disconnect?.();
    setTimeout(() => {
      setSubmitModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={submitModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{base: 'full', md: "xl"}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Submit Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <SubmitForm
              onSubmitSuccess={() => {
                disconnect?.();
                setTimeout(() => {
                  setSubmitModalOpen(false);
                }, 200);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>}
      {mobileDisplay && <Drawer placement="left" onClose={close} isOpen={submitModalOpen}>
          <DrawerOverlay>
            <DrawerContent>
              <DrawerHeader>Sign up</DrawerHeader>
              <DrawerCloseButton top=".75rem"/>
              <DrawerBody mt={".5rem"} height="100%" display="flex" flexDir="column">
                  <SubmitForm
                  onSubmitSuccess={() => {
                    disconnect?.();
                    setTimeout(() => {
                      setSubmitModalOpen(false);
                    }, 200);
                  }}
                />
              </DrawerBody>
            </DrawerContent>
          </DrawerOverlay>
        </Drawer>}
    </>
  );
};

export default SubmitModal;
