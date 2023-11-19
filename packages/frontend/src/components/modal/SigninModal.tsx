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
import SignupForm from '../form/SignupForm';
import { useResponsive } from '../hooks/useResponsive';
import SigninForm from '@components/form/SigninForm';

const SigninModal: FC = () => {
  const { signinModalOpen, setSigninModalOpen, setActiveAccountUser } = useLanding();
  const { mobileDisplay, tabletDisplay, desktopDisplay } = useResponsive();

  const {
    disconnect
  } = useInkathon();

  const close = () => {
    // disconnect?.();
    setTimeout(() => {
      setSigninModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={signinModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{ base: 'full', md: "xl" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sign in</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <SigninForm
              onSubmitSuccess={() => {
                disconnect?.();
                setTimeout(() => {
                  setSigninModalOpen(false);
                  setActiveAccountUser(true);
                }, 200);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>}
      {mobileDisplay && <Drawer placement="left" onClose={close} isOpen={signinModalOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader>Sign up</DrawerHeader>
            <DrawerCloseButton top=".75rem" />
            <DrawerBody mt={".5rem"} height="100%" display="flex" flexDir="column">
              <SigninForm
                onSubmitSuccess={() => {
                  disconnect?.();
                  setTimeout(() => {
                    setSigninModalOpen(false);
                    setActiveAccountUser(true);
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

export default SigninModal;
