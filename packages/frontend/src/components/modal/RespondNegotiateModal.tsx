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
import { useLanding } from '../../front-provider/src'
import { FC } from 'react';
import RespondNegotiateForm from '@components/form/RespondNegotiateForm';
import { useResponsive } from '../hooks/useResponsive';

const RespondNegotiateModal: FC = () => {
  const { respondNegotiateModalOpen, setRespondNegotiateModalOpen } = useLanding();
  const { mobileDisplay, tabletDisplay, desktopDisplay } = useResponsive();

  const close = () => {
    setTimeout(() => {
      setRespondNegotiateModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={respondNegotiateModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{ base: 'full', md: "xl" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Respond Negotiate</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <RespondNegotiateForm
              onSubmitSuccess={() => {
                setTimeout(() => {
                  setRespondNegotiateModalOpen(false);
                }, 200);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>}
      {mobileDisplay && <Drawer placement="left" onClose={close} isOpen={respondNegotiateModalOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader>Respond Negotiate</DrawerHeader>
            <DrawerCloseButton top=".75rem" />
            <DrawerBody mt={".5rem"} height="100%" display="flex" flexDir="column">
              <RespondNegotiateForm
                onSubmitSuccess={() => {
                  setTimeout(() => {
                    setRespondNegotiateModalOpen(false);
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

export default RespondNegotiateModal;
