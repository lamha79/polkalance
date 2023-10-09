import { Button, ButtonProps } from '@chakra-ui/react';
import { useLogin } from '../hooks/useLogin';
import { FC } from 'react';
import {ConnectButton} from '../../components/web3/ConnectButton';

interface LoginButtonProps extends ButtonProps {
  signupModalOpen: boolean;
}

const LoginButton: FC<LoginButtonProps> = ({
  children,
  signupModalOpen,
  ...props
}: LoginButtonProps) => {
  const { isLoading } = useLogin(signupModalOpen);

  return (
    <ConnectButton>
      <Button variant="link" size="md" {...props} isLoading={isLoading}>
        {children}
      </Button>
    </ConnectButton>
  );
};

export default LoginButton;
