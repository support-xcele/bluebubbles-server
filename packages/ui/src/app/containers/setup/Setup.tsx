import React from 'react';
import {
    Box,
    Flex,
    HStack,
    useColorModeValue,
    Link,
    Text,
    Tooltip,
    Switch,
    FormControl,
    useColorMode,
    Spacer,
    Divider
} from '@chakra-ui/react';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { WalkthroughLayout } from '../../layouts/walkthrough/WalkthroughLayout';
import logo from '../../../images/logo/xcelerate-logo.svg';


export const Setup = (): JSX.Element => {
    return (
        <Box height="100%">
            <NavBar />
            <Box p="2">
                <WalkthroughLayout />
            </Box>
        </Box>
    );
};

const NavBar = (): JSX.Element => {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <Flex
            height="20"
            alignItems="center"
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent='space-between'
            p={4}
            pl={6}
        >
            <Flex alignItems="center" justifyContent='flex-start'>
                <img src={logo} className="logo" alt="Xcelerate logo" height={40} width={40} />
                <Text fontSize="md" fontWeight="bold" ml={3} lineHeight="1.1">
                    Xcelerate<br />iMessage Bridge
                </Text>
            </Flex>
            <Flex justifyContent='flex-end'>
                <HStack spacing={{ base: '0', md: '1' }}>
                    <Tooltip label="Built by Xcelerate" aria-label="xcelerate-tip">
                        <Link
                            href="https://xcelegram.com"
                            style={{ textDecoration: 'none' }}
                            target="_blank"
                            fontSize="sm"
                            color="brand.primary"
                            fontWeight="600"
                            px={3}
                        >
                            Built by Xcelerate
                        </Link>
                    </Tooltip>
                    <Spacer />
                    <Divider orientation="vertical" width={1} height={15} borderColor='gray' />
                    <Spacer />
                    <Spacer />
                    <Spacer />
                    <FormControl display='flex' alignItems='center'>
                        <Box mr={2}><MdOutlineDarkMode size={20} /></Box>
                        <Switch id='theme-mode-toggle' onChange={toggleColorMode} isChecked={colorMode === 'light'} />
                        <Box ml={2}><MdOutlineLightMode size={20} /></Box>
                    </FormControl>
                </HStack>
            </Flex>
        </Flex>
    );
};
