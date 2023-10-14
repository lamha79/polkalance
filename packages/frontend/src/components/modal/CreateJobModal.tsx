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
import CreateJobForm from '../form/CreateJobForm';
import { useResponsive } from '../hooks/useResponsive';

const CreateJobModal: FC = () => {
  const { createJobModalOpen, setCreateJobModalOpen } = useLanding();
  const {mobileDisplay , tabletDisplay, desktopDisplay} = useResponsive();

  const {
    disconnect
  } = useInkathon();

  const close = () => {
    disconnect?.();
    setTimeout(() => {
      setCreateJobModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={createJobModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{base: 'full', md: "xl"}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Job</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <CreateJobForm
              onSubmitSuccess={() => {
                disconnect?.();
                setTimeout(() => {
                  setCreateJobModalOpen(false);
                }, 200);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>}
      {mobileDisplay && <Drawer placement="left" onClose={close} isOpen={createJobModalOpen}>
          <DrawerOverlay>
            <DrawerContent>
              <DrawerHeader>Sign up</DrawerHeader>
              <DrawerCloseButton top=".75rem"/>
              <DrawerBody mt={".5rem"} height="100%" display="flex" flexDir="column">
                  <CreateJobForm
                  onSubmitSuccess={() => {
                    disconnect?.();
                    setTimeout(() => {
                      setCreateJobModalOpen(false);
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

export default CreateJobModal;
