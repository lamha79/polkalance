import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react';
import { useLanding } from '../../front-provider/src'
import { FC } from 'react';
import HistoryForm from '@components/form/HistoryForm';
import { useResponsive } from '../hooks/useResponsive';

const HistoryModal: FC = () => {
  const { historyModalOpen, setHistoryModalOpen } = useLanding();
  const {mobileDisplay , tabletDisplay, desktopDisplay} = useResponsive();
  const close = () => {
    setTimeout(() => {
      setHistoryModalOpen(false);
    }, 200);
  };

  return (
    <>
      {(desktopDisplay || tabletDisplay) && <Modal isOpen={historyModalOpen} onClose={close} isCentered={mobileDisplay ? false : true} size={{base: 'full', md: "xl"}}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>History Jobs</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <HistoryForm/>
          </ModalBody>
        </ModalContent>
      </Modal>}
    </>
  );
};

export default HistoryModal;
