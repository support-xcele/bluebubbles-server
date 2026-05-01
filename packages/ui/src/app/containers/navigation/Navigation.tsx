import React from 'react';
import { HashRouter as Router, Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom';
import type { AnyAction } from '@reduxjs/toolkit';
import {
    IconButton,
    Box,
    CloseButton,
    Flex,
    HStack,
    Icon,
    Link,
    Drawer,
    DrawerContent,
    Text,
    useDisclosure,
    BoxProps,
    FlexProps,
    Tooltip,
    DrawerOverlay,
    DrawerHeader,
    DrawerBody,
    Switch,
    FormControl,
    useColorMode,
    Spacer,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Button,
    Badge,
    Divider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiHome, FiSettings, FiMenu, FiBell, FiTrash } from 'react-icons/fi';
import { AiOutlineBug, AiOutlineApi, AiOutlineDownload } from 'react-icons/ai';
import { BsChevronDown, BsCheckAll, BsPersonCircle, BsFillCalendarCheckFill } from 'react-icons/bs';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { IconType } from 'react-icons';

import { ContactsLayout } from 'app/layouts/contacts/ContactsLayout';

import { HomeLayout } from '../../layouts/home/HomeLayout';
import { LogsLayout } from '../../layouts/logs/LogsLayout';
import { SettingsLayout } from '../../layouts/settings/SettingsLayout';
import { ApiLayout } from '../../layouts/api/ApiLayout';
import logo from '../../../images/logo/xcelerate-logo.svg';
import { NotificationsTable } from '../../components/tables/NotificationsTable';
import './styles.css';

import { useAppSelector, useAppDispatch } from '../../hooks';
import { installUpdate } from '../../utils/IpcUtils';
import { showSuccessToast } from '../../utils/ToastUtils';
import { readAll, clear as clearAlerts, NotificationItem } from '../../slices/NotificationsSlice';
import { ScheduledMessagesLayout } from 'app/layouts/scheduledMessages/ScheduledMessagesLayout';


const downloadAndInstallUpdate = async () => {
    await installUpdate();
    showSuccessToast({
        id: 'update',
        title: 'Update Downloading',
        description: (
            'Downloading & Installing update in the background. ' +
            'The server will automatically restart when the update is complete.'
        )
    });
};

interface LinkItemProps {
    name: string;
    icon: IconType;
    to: string;
}
// Xcelerate skin: trimmed sidebar. Removed Android Devices, Notifications (FCM),
// and Guides & Links — the underlying routes/components are kept in the codebase
// in case BlueBubbles upstream is merged later, they're just not exposed here.
const LinkItems: Array<LinkItemProps> = [
    { name: 'Home', icon: FiHome, to: '/' },
    { name: 'Contacts', icon: BsPersonCircle, to: '/contacts' },
    { name: 'Scheduled Messages', icon: BsFillCalendarCheckFill, to: '/scheduled-messages' },
    { name: 'API & Webhooks', icon: AiOutlineApi, to: '/webhooks' },
    { name: 'Debug & Logs', icon: AiOutlineBug, to: '/logs' },
    { name: 'Settings', icon: FiSettings, to: '/settings' }
];

const closeNotification = (closeFunc: () => void, dispatch: React.Dispatch<AnyAction>) => {
    dispatch(readAll());
    closeFunc();
};

export const Navigation = (): JSX.Element => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isNotificationsOpen,
        onOpen: onNotificationOpen,
        onClose: onNotificationClose
    } = useDisclosure();

    const notifications: Array<NotificationItem> = useAppSelector(state => state.notificationStore.notifications);
    const unreadCount = notifications.filter(e => !e.read).length;
    const dispatch = useAppDispatch();

    return (
        <Box minH="100vh">
            <Router>
                <SidebarContent onClose={() => onClose} display={{ base: 'none', md: 'block' }} />
                <Drawer
                    autoFocus={false}
                    isOpen={isOpen}
                    placement="left"
                    onClose={onClose}
                    returnFocusOnClose={false}
                    onOverlayClick={onClose}
                    size="full"
                >
                    <DrawerContent>
                        <SidebarContent onClose={onClose} />
                    </DrawerContent>
                </Drawer>
                {/* mobilenav */}
                <MobileNav onOpen={onOpen} onNotificationOpen={onNotificationOpen} unreadCount={unreadCount} />
                <Box ml={{ base: 0, md: 60 }} p="2">
                    <Routes>
                        <Route path="/settings" element={<SettingsLayout />} />
                        <Route path="/logs" element={<LogsLayout />} />
                        <Route path="/contacts" element={<ContactsLayout />} />
                        <Route path="/scheduled-messages" element={<ScheduledMessagesLayout />} />
                        <Route path="/webhooks" element={<ApiLayout />} />
                        <Route path="/" element={<HomeLayout />} />
                    </Routes>
                </Box>
            </Router>

            <Drawer onClose={() => closeNotification(onNotificationClose, dispatch)} isOpen={isNotificationsOpen} size="lg">
                <DrawerOverlay />
                <DrawerContent  maxW="75%" minWidth="600px">
                    <DrawerHeader>Notifications / Alerts ({unreadCount})</DrawerHeader>
                    <DrawerBody overflowWrap='break-word'>
                        <Menu>
                            <MenuButton
                                as={Button}
                                rightIcon={<BsChevronDown />}
                                width="12em"
                                mr={5}
                                mb={4}
                            >
                                Manage
                            </MenuButton>
                            <MenuList>
                                <MenuItem icon={<FiTrash />} onClick={() => {
                                    dispatch(clearAlerts({ showToast: true }));
                                }}>
                                    Clear Alerts
                                </MenuItem>
                                <MenuItem icon={<BsCheckAll />} onClick={() => {
                                    dispatch(readAll());
                                }}>
                                    Mark All as Read
                                </MenuItem>
                            </MenuList>
                        </Menu>
                        <NotificationsTable notifications={notifications} />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

interface SidebarProps extends BoxProps {
    onClose: () => void;
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    return (
        <Box
            {...({ variant: 'glass' } as any)}
            minW='16em'
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            borderRadius="0"
            borderLeft="0"
            borderTop="0"
            borderBottom="0"
            {...rest}
        >
            <Flex h="20" alignItems="center" mx="6" justifyContent="flex-start">
                <motion.img
                    src={logo}
                    className="logo"
                    alt="Xcelerate logo"
                    height={40}
                    width={40}
                    whileHover={{ scale: 1.04 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
                <Text fontSize="md" fontWeight="bold" ml={3} lineHeight="1.1">
                    Xcelerate<br />iMessage Bridge
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {LinkItems.map(link => (
                <RouterLink key={link.name} to={link.to}>
                    <NavItem icon={link.icon} to={link.to}>{link.name}</NavItem>
                </RouterLink>
            ))}
        </Box>
    );
};

interface NavItemProps extends FlexProps {
    icon: IconType;
    to: string;
    children: string | number;
}
const NavItem = ({ icon, to, children, ...rest }: NavItemProps) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Box position="relative" mx="4" my="1">
            {isActive && (
                <motion.div
                    layoutId="active-pill"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '12px',
                        background: 'var(--xcelerate-accent)',
                        opacity: 0.18,
                        border: '1px solid var(--xcelerate-accent)',
                        zIndex: 0
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
            <Flex
                align="center"
                p="4"
                borderRadius="12px"
                role="group"
                cursor="pointer"
                position="relative"
                zIndex={1}
                _hover={{
                    bg: isActive ? undefined : 'rgba(255,255,255,0.06)',
                    color: 'white'
                }}
                color={isActive ? 'brand.primary' : 'current'}
                {...rest}
            >
                {icon && (
                    <Icon
                        mr="4"
                        fontSize="16"
                        _groupHover={{
                            color: 'white'
                        }}
                        as={icon}
                    />
                )}
                {children}
            </Flex>
        </Box>
    );
};

interface MobileProps extends FlexProps {
    onOpen: () => void;
    onNotificationOpen: () => void;
    unreadCount: number;
}
const MobileNav = ({ onOpen, onNotificationOpen, unreadCount, ...rest }: MobileProps) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const updateAvailable: boolean = (useAppSelector(state => state.config.update_available?.show) ?? false);
    const updateVersion: string = (useAppSelector(state => state.config.update_available?.version) ?? '');

    return (
        <Box
            {...({ variant: 'glass' } as any)}
            display="flex"
            ml={{ base: 0, md: 255 }}
            px={{ base: 4, md: 4 }}
            height="20"
            alignItems="center"
            justifyContent={{ base: 'space-between', md: 'flex-end' }}
            position="sticky"
            top="0"
            zIndex="sticky"
            borderRadius="0"
            borderLeft="0"
            borderRight="0"
            borderTop="0"
            {...(rest as BoxProps)}
        >
            <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />

            <Text display={{ base: 'flex', md: 'none' }} fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                <img style={{ minWidth: '48px' }} src={logo} className="logo-small" alt="logo" />
            </Text>

            <HStack spacing={{ base: '0', md: '1' }}>
                {(updateAvailable) ? (
                    <Box position='relative' float='left'>
                        <Tooltip label="Update Available" aria-label="update-tip">
                            <IconButton
                                size="lg"
                                variant="ghost"
                                aria-label="update"
                                icon={<AiOutlineDownload />}
                                onClick={downloadAndInstallUpdate}
                            />
                        </Tooltip>
                        <Badge
                            borderRadius='lg'
                            variant='solid'
                            colorScheme='green'
                            position='absolute'
                            margin={0}
                            top={2}
                            right={8}
                            zIndex={2}
                            fontSize={10}
                        >v{updateVersion}</Badge>
                    </Box>
                ): null}
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
                <Box position='relative' float='left'>
                    <IconButton
                        size="lg"
                        verticalAlign='middle'
                        zIndex={1}
                        variant="ghost"
                        aria-label="notifications"
                        icon={<FiBell />}
                        onClick={() => onNotificationOpen()}
                    />
                    {(unreadCount > 0) ? (
                        <Badge
                            borderRadius={10}
                            variant='solid'
                            colorScheme='red'
                            position='absolute'
                            margin={0}
                            top={1}
                            right={1}
                            zIndex={2}
                            minWidth={5}
                            minHeight={5}
                            textAlign={'center'}
                            paddingTop='1px'
                        >{unreadCount}</Badge>
                    ) : null}
                </Box>
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
        </Box>
    );
};
