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
import AuctionForm from '../form/AuctionForm';
import { useResponsive } from '../hooks/useResponsive';

const AuctionModal: FC = () => {
  const { auctionModalOpen, setAuctionModalOpen } = useLanding();
  const {mobileDisplay , tabletDisplay, desktopDisplay} = useResponsive();

  const {
    disconnect
  } = useInkathon();

  const close = () => {
    // disconnect?.();
    setTimeout(() => {
      setAuctionModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={auctionModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{base: 'full', md: "xl"}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Auction Job</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <AuctionForm
              onSubmitSuccess={() => {
                // disconnect?.();
                setTimeout(() => {
                  setAuctionModalOpen(false);
                }, 200);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>}
    </>
  );
};

export default AuctionModal;
