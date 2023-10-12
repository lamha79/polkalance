import { Box, Flex, FlexProps, Text } from '@chakra-ui/react';
import { useCurrentUser, useLanding } from '../../front-provider/src';
import { changeUserType } from '../../services/user';
import { FC, useState } from 'react';
import { User, UserTypeEnum } from '../../utility/src/index';
import { useResponsive } from '../hooks/useResponsive';

interface UserTypeSwitchProps extends FlexProps{
  onCloseMenu?: () => void
}

function getUser(user: User) {
  return user;
}

const UserTypeSwitch: FC<UserTypeSwitchProps> = ({ onCloseMenu, ...props }) => {
  const { setType, type } = useLanding();
  const { user, setUser } = useCurrentUser();
  const [isPuting, setIsPuting] = useState(false);
  const {mobileDisplay} = useResponsive();

  const setUserType = async (newType: UserTypeEnum) => {
    setType(newType);
    if (mobileDisplay && onCloseMenu !== undefined) {
      onCloseMenu();
    }
    if (user && !isPuting) {
      if (user.currentUserType && user.currentUserType.toLowerCase() !== newType.toLowerCase()) {
        setIsPuting(true);
        const res = getUser({
          email: "",
          firstname: "LAM",
          lastname: "HA",
          description: "",
          phone: "",
          language: [],
          location: "",
          profilePicture: "",
          links: [],
          createdAt: "",
          updatedAt: "",
          hasFreelanceProfile: "",
          currentUserType: newType,
          tosAcceptedOn: "",
          wallet: ""
        });
        setUser(res);
        setIsPuting(false);
      }
    }
  };

  return (
    <Flex {...props}>
      <Box
        borderColor="brand.primary"
        borderWidth="1px"
        borderRightWidth={0}
        borderRadius="32px 0 0 32px"
        transition="all ease-in-out 250ms"
        py={1.5}
        px={4}
        bgColor={(type === UserTypeEnum.Freelancer || type === UserTypeEnum.Guest) ? '#fdb81e' : 'none'}
        cursor="pointer"
        _hover={{ bgColor: 'brand.primaryHover', borderColor: 'brand.primaryHover' }}
        onClick={() => setUserType(UserTypeEnum.Freelancer)}
      >
        <Text fontFamily="Comfortaa" fontSize="sm" fontWeight="600">
          Freelance
        </Text>
      </Box>
      <Box
        borderColor="brand.primary"
        borderWidth="1px"
        borderLeftWidth={0}
        borderRadius="0 32px 32px 0"
        transition="all ease-in-out 250ms"
        py={1.5}
        px={4}
        cursor="pointer"
        bgColor={type === UserTypeEnum.Company ? '#fdb81e' : 'none'}
        _checked={{ bgColor: '#fdb81e', borderColor: '#fdb81e' }}
        _hover={{ bgColor: 'brand.primaryHover', borderColor: 'brand.primaryHover' }}
        onClick={() => setUserType(UserTypeEnum.Company)}
      >
        <Text fontFamily="Comfortaa" fontSize="sm" fontWeight="600">
          Company
        </Text>
      </Box>
    </Flex>
  );
};

export default UserTypeSwitch;
