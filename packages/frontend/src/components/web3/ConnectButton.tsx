import { SupportedChainId } from '@azns/resolver-core'
import { useResolveAddressToDomain } from '@azns/resolver-react'
import {
  Button,
  HStack,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from '@chakra-ui/react'
import { env } from '@/components/config/environment'
import { InjectedAccount } from '@polkadot/extension-inject/types'
import { encodeAddress } from '@polkadot/util-crypto'
import {
  SubstrateChain,
  SubstrateWalletPlatform,
  allSubstrateWallets,
  getSubstrateChain,
  isWalletInstalled,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { truncateHash } from '@/utils/truncateHash'
import { useIsSSR } from '@/utils/useIsSSR'
import Image from 'next/image'
import aznsIconSvg from 'public/icons/azns-icon.svg'
import { FC, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { AiOutlineCheckCircle, AiOutlineDisconnect } from 'react-icons/ai'
import { FiChevronDown, FiExternalLink } from 'react-icons/fi'
import { useLanding } from '@front-provider/src'
import { useLogin } from '@components/hooks/useLogin'
import { useConnect } from '@components/hooks/useConnect'
import { useResponsive } from '@components/hooks/useResponsive'

export interface ConnectButtonProps {}
export const ConnectButton: FC<ConnectButtonProps> = () => {
  const {
    activeChain,
    switchActiveChain,
    connect,
    disconnect,
    isConnecting,
    activeAccount,
    accounts,
    setActiveAccount,
  } = useInkathon()
  const { balanceFormatted } = useBalance(activeAccount?.address, true, {
    forceUnit: false,
    fixedDecimals: 2,
    removeTrailingZeros: true,
  })
  const [supportedChains] = useState(
    env.supportedChains.map((networkId) => getSubstrateChain(networkId) as SubstrateChain),
  )
  const [browserWallets] = useState(
    allSubstrateWallets.filter((w) => w.platforms.includes(SubstrateWalletPlatform.Browser)),
  )
  const isSSR = useIsSSR()
  const { setSigninModalOpen, signupModalOpen, setIsCheckWallet, isCheckWallet } = useLanding();
  const { checkExistWallet } = useLogin(signupModalOpen);
  const { signOut } = useConnect();
  const { mobileDisplay } = useResponsive();
  useEffect(() => {
      setIsCheckWallet(false);
  }, []);
  // Connect Button
  if (!activeAccount)
    return (
      <Menu>
        <MenuButton
          as={Button}
          isLoading={isConnecting}
          size="md"
          rightIcon={<FiChevronDown size={22} />}
          py={6}
          height={"40px"}
          backgroundColor={"#fdb81e"}
          textColor={'#002c39'}
          fontFamily={'Comfortaa'}
          fontSize={'1rem'}
          fontWeight={'700'}
          lineHeight={'133%'}
          rounded="2xl"
          colorScheme="purple"
        >
          Connect Wallet
        </MenuButton>

        <MenuList bgColor="blackAlpha.900" borderColor="whiteAlpha.300" rounded="2xl">
          {/* Installed Wallets */}
          {!isSSR &&
            !activeAccount &&
            browserWallets.map((w) =>
              isWalletInstalled(w) ? (
                <MenuItem
                  key={w.id}
                  onClick={() => {
                    connect?.(undefined, w)
                  }}
                  tw="bg-transparent hocus:bg-gray-800"
                >
                  {w.name}
                </MenuItem>
              ) : (
                <MenuItem
                  as={Link}
                  href={w.urls.website}
                    key={w.id}
                    _hover={{
                      background: "#fdb81e"
                    }}
                    tw="bg-transparent opacity-50 hocus:bg-gray-800 hover:#fdb81e"
                >
                  <VStack align="start" spacing={0}>
                    <HStack>
                      <Text>{w.name}</Text>
                      <FiExternalLink size={16} />
                    </HStack>
                    <Text fontSize="xs">Not installed</Text>
                  </VStack>
                </MenuItem>
              ),
            )}
        </MenuList>
      </Menu>
    )
    
  // Account Menu & Disconnect Button
  return (
    <Menu>
      <HStack>
        {/* Account Balance */}
        {(balanceFormatted !== undefined && !mobileDisplay) && (
          <Button
            py={6}
            pl={5}
            marginLeft="25px"
            rounded="2xl"
            fontWeight="bold"
            fontSize="sm"
            fontFamily="mono"
            letterSpacing={-0.25}
            pointerEvents="none"
            backgroundColor={"#fdb81e"}
            _hover={{
              background: "#805ad5"
            }}
          >
            {balanceFormatted}
          </Button>
        )}

        {/* Account Name, Address, and AZNS-Domain (if assigned) */ 
        <MenuButton
          as={Button}
          rightIcon={<FiChevronDown size={22} />}
          hidden={false}
          py={6}
          pl={5}
          rounded="2xl"
          fontWeight="bold"
            backgroundColor={"#fdb81e"}
            _hover={{
              background: "#805ad5"
            }}
        >
          <VStack spacing={0.5}>
            <AccountName account={activeAccount} />
            <Text fontSize="xs" fontWeight="normal" opacity={0.75}>
              {truncateHash(encodeAddress(activeAccount.address, activeChain?.ss58Prefix || 42), 8)}
            </Text>
          </VStack>
        </MenuButton>
        }
      </HStack>

      <MenuList
        bgColor="blackAlpha.900"
        borderColor="whiteAlpha.300"
        rounded="2xl"
        maxHeight="40vh"
        overflow="scroll"
      >
        {/* Supported Chains */}
        {supportedChains.map((chain) => (
          <MenuItem
            key={chain.network}
            isDisabled={chain.network === activeChain?.network}
            onClick={async () => {
              await switchActiveChain?.(chain)
              toast.success(`Switched to ${chain.name}`)
            }}
            tw="bg-transparent hocus:#fdb81e"
          >
            <VStack align="start" spacing={0}>
              <HStack>
                <Text>{chain.name}</Text>
                {chain.network === activeChain?.network && <AiOutlineCheckCircle size={16} />}
              </HStack>
            </VStack>
          </MenuItem>
        ))}

        {/* Available Accounts/Wallets */}
        <MenuDivider />
        {(accounts || []).map((acc) => {
          const encodedAddress = encodeAddress(acc.address, activeChain?.ss58Prefix || 42)
          const truncatedEncodedAddress = truncateHash(encodedAddress, 10)
          setTimeout(() => {
            setSigninModalOpen(false);
            setIsCheckWallet(false);
            checkExistWallet?.();
          }, 200);
          return (
            <MenuItem
              key={encodedAddress}
              isDisabled={acc.address === activeAccount.address}
              onClick={() => {
                setActiveAccount?.(acc)
                setIsCheckWallet(false);
                checkExistWallet?.()
              }}
              tw="bg-transparent hocus:#fdb81e"
            >
              <VStack align="start" spacing={0}>
                <HStack>
                  <AccountName account={acc} />
                  {acc.address === activeAccount.address && <AiOutlineCheckCircle size={16} />}
                </HStack>
                <Text fontSize="xs">{truncatedEncodedAddress}</Text>
              </VStack>
            </MenuItem>
          )
        })}

        {/* Disconnect Button */}
        <MenuDivider />
        <MenuItem
          onClick={() => {
            disconnect?.()
            signOut?.();
          }}
          icon={<AiOutlineDisconnect size={18} />}
          tw="bg-transparent hocus:#fdb81e"
        >
          Disconnect
        </MenuItem>
      </MenuList>
    </Menu>
  )
}

export interface AccountNameProps {
  account: InjectedAccount
}
export const AccountName: FC<AccountNameProps> = ({ account, ...rest }) => {
  const { activeChain } = useInkathon()
  const doResolveAddress = useMemo(
    () => Object.values(SupportedChainId).includes(activeChain?.network as SupportedChainId),
    [activeChain?.network],
  )
  const { primaryDomain } = useResolveAddressToDomain(
    doResolveAddress ? account?.address : undefined,
    {
      chainId: activeChain?.network,
      debug: true,
    },
  )

  return (
    <Text
      fontSize="sm"
      fontFamily="mono"
      fontWeight="bold"
      textTransform="uppercase"
      display="flex"
      letterSpacing={-0.25}
      alignItems="baseline"
      gap="4px"
      {...rest}
    >
      {primaryDomain || account.name}
      {!!primaryDomain && <Image src={aznsIconSvg} alt="AZERO.ID Logo" width={11} height={11} />}
    </Text>
  )
}
