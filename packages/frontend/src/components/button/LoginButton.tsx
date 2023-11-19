import { Button, ButtonProps } from '@chakra-ui/react';
import { useLogin } from '../hooks/useLogin';
import { FC } from 'react';
import { ConnectButton } from '../../components/web3/ConnectButton';
import { useResponsive } from '@components/hooks/useResponsive';
import { useLanding } from '@front-provider/src';

interface LoginButtonProps extends ButtonProps {
  signupModalOpen: boolean;
}

const LoginButton: FC<LoginButtonProps> = ({
  children,
  signupModalOpen,
  ...props
}: LoginButtonProps) => {
  const { isLoading } = useLogin(signupModalOpen);
  const { setSigninModalOpen } = useLanding();

  return (
    <Button variant="link" size="md" {...props} isLoading={isLoading}
      onClick={() => {
        setSigninModalOpen(true)
      }}
      backgroundColor={"#fdb81e"}
      padding={"10px 24px 10px 24px"}
    >
        {children}
    </Button>
  );
};

export default LoginButton;
