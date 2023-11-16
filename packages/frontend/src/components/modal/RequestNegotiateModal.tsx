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
import RequestNegotiateForm from '@components/form/RequestNegotiateForm';
import { useResponsive } from '../hooks/useResponsive';

const RequestNegotiateModal: FC = () => {
  const { requestNegotiateModalOpen, setRequestNegotiateModalOpen } = useLanding();
  const { mobileDisplay, tabletDisplay, desktopDisplay } = useResponsive();

  const close = () => {
    setTimeout(() => {
      setRequestNegotiateModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={requestNegotiateModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{ base: 'full', md: "xl" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Negotiate</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <RequestNegotiateForm
              onSubmitSuccess={() => {
                setTimeout(() => {
                  setRequestNegotiateModalOpen(false);
                }, 200);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>}
      {mobileDisplay && <Drawer placement="left" onClose={close} isOpen={requestNegotiateModalOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader>Request Negotiate</DrawerHeader>
            <DrawerCloseButton top=".75rem" />
            <DrawerBody mt={".5rem"} height="100%" display="flex" flexDir="column">
              <RequestNegotiateForm
                onSubmitSuccess={() => {
                  setTimeout(() => {
                    setRequestNegotiateModalOpen(false);
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

export default RequestNegotiateModal;
