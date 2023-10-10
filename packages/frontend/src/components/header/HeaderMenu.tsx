import { Box, Flex } from '@chakra-ui/react';
import { FC } from 'react';
import Link from 'next/link';
import { useLanding } from '../../front-provider/src';
import { useResponsive } from '../hooks/useResponsive';
import CreateJobModal from '../modal/CreateJobModal';

interface MenuElement {
  id: string;
  label: string;
}

const menuElement: MenuElement[] = [
  { id: 'product', label: 'Product' },
  { id: 'technology', label: 'Technology' },
  { id: 'community', label: 'Community' },
  { id: 'contact', label: 'Contact' }
];

interface HeaderMenuProps {
  noActive?: boolean;
  onCloseMenu?: () => void
}

const HeaderMenu: FC<HeaderMenuProps> = ({ onCloseMenu, noActive = false }) => {
  const { currentView, setCurrentView, setCreateJobModalOpen } = useLanding();
  const { mobileDisplay } = useResponsive();

  const handleClick = (id: string) => {
    if (mobileDisplay && onCloseMenu) {
      setCurrentView(id);
      onCloseMenu();
    }
  };

  return (
    <Flex flexDir={{base: 'column', lg: 'row'}} ml={{base: 0, md: 4, xl: 0}} justifyContent="center" alignItems="center" columnGap={{md: 8, xl: 16}} rowGap={8}>
      {menuElement.map((v, k) => {
        const active = !noActive && currentView === v.id;
        return (
          <Link key={k} href={`#${v.id}`} passHref onClick={() => handleClick(v.id)}>
            <Box
              fontFamily="Comfortaa"
              fontSize="md"
              fontWeight="700"
              color="neutral.dsDarkGray"
              position="relative"
              _hover={{
                color: '#fdb81e',
                _after: {
                  opacity: '1',
                  visibility: 'visible'
                }
              }}
              _after={{
                transition: 'all ease-in-out 250ms',
                content: `""`,
                position: 'absolute',
                display: 'block',
                height: '2px',
                width: '100%',
                bgColor: '#fdb81e',
                opacity: active ? '1' : '0',
                visibility: active ? 'visible' : 'hidden'
              }}
            >
              {v.label}
            </Box>
          </Link>
        );
      })}
    </Flex>
  );
};

export default HeaderMenu;
