import { Box, Button, Flex, FormControl, FormLabel, Text } from "@chakra-ui/react";
import { ErrorMessage, Field, FieldProps, useFormikContext } from "formik";
import { FC } from "react";
import LockIcon from "../icons/LockIcon";
import { usePriceFeed } from "../../../front/hooks/usePriceFeed";
import { MainnetTokens, TestnetTokens } from "../../../utility/src";
import { useCurrentUser } from "../../../front-provider/src";

interface ContractDefferedAmountSelectorProps {
    id: string;
    label: string;
    snapshotDone: boolean;
    onSnapshot: (isGood: boolean) => void;
}

const options = [
    "0", "20", "40", "60", "80"
]

const ContractDefferedAmountSelector: FC<ContractDefferedAmountSelectorProps> = ({id, label, snapshotDone, onSnapshot}) => {
    const { values, errors, setFieldValue, setFieldTouched} = useFormikContext();
    const { user } = useCurrentUser();

    return (
    <FormControl id={id}>
        <Flex alignItems={{base: 'center', lg: 'initial'}} flexDir={{base: 'column', lg: 'row'}}>
            
        </Flex>
        <ErrorMessage name={id}>
            {(msg) => <Text textStyle="errorMessage">{msg}</Text>}
        </ErrorMessage>
    </FormControl>
    );
};

export default ContractDefferedAmountSelector;