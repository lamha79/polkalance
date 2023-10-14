import { Button, Flex, IconButton, Text } from '@chakra-ui/react'
import Cookies from 'js-cookie';
import { useCurrentUser, useLanding } from '../../front-provider/src'
import { FC } from 'react'
import LoginButton from '../button/LoginButton'
import NotificationIcon from '../icons/NotificationIcon'
import MessageIcon from '../icons/MessageIcon'
import { UserTypeEnum, shortHash } from '../../utility/src'
import { useRouter } from 'next/router'
import { useResponsive } from '../hooks/useResponsive'
import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { ConnectButton } from '@components/web3/ConnectButton';

interface HeaderButtonProps {
  onCloseMenu?: () => void
}

const HeaderButton: FC<HeaderButtonProps> = ({ onCloseMenu }) => {
  const { user, logout } = useCurrentUser()
  const { signupModalOpen, setSignupModalOpen , activeAccountUser, type, setActiveAccountUser} = useLanding()
  const { push, pathname } = useRouter()
  const { mobileDisplay } = useResponsive()
  const { setUser } = useCurrentUser();
  const {
    disconnect,
    activeAccount
  } = useInkathon()

  const handleLogout = () => {
    if (mobileDisplay && onCloseMenu) {
      onCloseMenu()
    }
    disconnect?.();
    push('/');
    Cookies.remove('authenticated');
    setUser(null);
    setActiveAccountUser(false);
  }

  const handleNavigate = () => {
    if (mobileDisplay && onCloseMenu) {
      onCloseMenu()
    }
    push('/dashboard/chat')
  }

  return (
    <Flex justifyContent={{ base: 'center', lg: 'normal' }}>
        {((!user)) && (
        <>
        {/* <LoginButton signupModalOpen={signupModalOpen} mr={{ base: 0, md: 4, xl: 8 }}>
          Login
        </LoginButton> */}
        <ConnectButton />
        </>
        )}

        {!activeAccountUser && <Button
          backgroundColor={'#fdb81e'}
          textColor={'#002c39'}
          fontFamily={'Comfortaa'}
          fontSize={'1rem'}
          fontWeight={'700'}
          lineHeight={'133%'}
          borderRadius={'32'}
          height={"48px"}
          variant="primary"
          ml={{ base: 0, md: 4, xl: 8 }}
          onClick={() => {
            if (mobileDisplay && onCloseMenu) {
              onCloseMenu()
            }
            setSignupModalOpen(true)            
          }}
        >
          Sign up
        </Button>}
        
      {user && activeAccountUser && (
        <Flex
          alignItems="center"
          columnGap={{ base: 8, md: 4, xl: 8 }}
          flexDir={{ base: 'column', lg: 'row' }}
          rowGap={4}
        >
          <Flex display={{ base: 'none', lg: 'flex' }} alignItems="center" columnGap={4}>
            <IconButton
              variant="icon"
              bgColor={pathname === '/dashboard/chat' ? 'brand.primary' : ''}
              transition="all ease-in-out 250ms"
              _hover={{
                color: pathname === '/dashboard/chat' ? 'brand.primary' : 'brand.primary',
                bgColor: pathname === '/dashboard/chat' ? 'neutral.dsDarkGray' : '',
              }}
              aria-label="Message Icon"
              icon={<MessageIcon />}
              onClick={handleNavigate}
            />
            <IconButton variant="icon" aria-label="Message Icon" icon={<NotificationIcon />} />
          </Flex>
          <ConnectButton />
          <Button variant="outline" size="md" onClick={handleLogout}>
            Disconnect
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

export default HeaderButton
