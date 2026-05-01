import React from 'react';
import {
    Box,
    Text,
    Heading,
    LinkBox,
    LinkOverlay,
    Wrap,
    WrapItem,
    SlideFade
} from '@chakra-ui/react';

export const IntroWalkthrough = (): JSX.Element => {
    return (
        <SlideFade in={true} offsetY='150px'>
            <Box px={5}>
                <Text fontSize='4xl'>Welcome to the Xcelerate iMessage Bridge</Text>
                <Text fontSize='md' mt={5}>
                    This server app exposes a local REST + Socket.IO API for sending and receiving iMessages
                    on this Mac. Configure webhooks, scheduled messages, and contacts from the sidebar — the
                    Xcelerate platform talks to this bridge directly.
                </Text>
                <Text fontSize='3xl' mt={10}>Useful Resources</Text>
                <Text fontSize='md' my={5}>
                    The links below point to the upstream Xcelerate Management project, which this bridge is built on.
                </Text>
                <Wrap spacing='10px'>
                    <WrapItem>
                        <LinkBox as='article' maxW='sm' px='5' pb={5} pt={2} borderWidth='1px' rounded='xl'>
                            <Text color='gray'>
                                https://bluebubbles.app/install
                            </Text>
                            <Heading size='md' my={2}>
                                <LinkOverlay href='https://bluebubbles.app/install' target='_blank'>
                                    Installation Guide
                                </LinkOverlay>
                            </Heading>
                            <Text>
                                Let us help walk you through the full setup of Xcelerate Management. This guide will take you step
                                by step to learn how to setup Google FCM and the Xcelerate Management Server.
                            </Text>
                        </LinkBox>
                    </WrapItem>
                    <WrapItem>
                        <LinkBox as='article' maxW='sm' px='5' pb={5} pt={2} borderWidth='1px' rounded='xl'>
                            <Text color='gray'>
                                https://docs.bluebubbles.app
                            </Text>
                            <Heading size='md' my={2}>
                                <LinkOverlay href='https://docs.bluebubbles.app' target='_blank'>
                                    Documentation &amp; User Guide
                                </LinkOverlay>
                            </Heading>
                            <Text>
                                Read about what Xcelerate Management has to offer, how to set it up, and how to use the plethora
                                of features. This documentation also provides more links to other useful articles.
                            </Text>
                        </LinkBox>
                    </WrapItem>
                    <WrapItem>
                        <LinkBox as='article' maxW='sm' px='5' pb={5} pt={2} borderWidth='1px' rounded='xl'>
                            <Text color='gray'>
                                https://documenter.getpostman.com
                            </Text>
                            <Heading size='md' my={2}>
                                <LinkOverlay href='https://documenter.getpostman.com/view/765844/UV5RnfwM' target='_blank'>
                                    REST API
                                </LinkOverlay>
                            </Heading>
                            <Text>
                                If you're a developer looking to utilize the REST API to interact with iMessage in unique
                                ways, look no further. Perform automation, orchestration, or basic scripting!
                            </Text>
                        </LinkBox>
                    </WrapItem>
                    <WrapItem>
                        <LinkBox as='article' maxW='sm' px='5' pb={5} pt={2} borderWidth='1px' rounded='xl'>
                            <Text color='gray'>
                                https://bluebubbles.app/faq
                            </Text>
                            <Heading size='md' my={2}>
                                <LinkOverlay href='https://bluebubbles.app/faq' target='_blank'>
                                    FAQ
                                </LinkOverlay>
                            </Heading>
                            <Text>
                                If you have any questions, someone else has likely already asked them! View our frequently
                                asked questions to figure out how you may be able to solve an issue.
                            </Text>
                        </LinkBox>
                    </WrapItem>
                    <WrapItem>
                        <LinkBox as='article' maxW='sm' px='5' pb={5} pt={2} borderWidth='1px' rounded='xl'>
                            <Text color='gray'>
                                https://bluebubbles.app/web
                            </Text>
                            <Heading size='md' my={2}>
                                <LinkOverlay href='https://bluebubbles.app/web' target='_blank'>
                                    Xcelerate Management Web
                                </LinkOverlay>
                            </Heading>
                            <Text>
                                Xcelerate Management is not limited to running on your Android device. It can also be run in your
                                browser so you can use it on the go! Connect it to this server once setup is complete.
                            </Text>
                        </LinkBox>
                    </WrapItem>
                    <WrapItem>
                        <LinkBox as='article' maxW='sm' px='5' pb={5} pt={2} borderWidth='1px' rounded='xl'>
                            <Text color='gray'>
                                https://bluebubbles.app/donate
                            </Text>
                            <Heading size='md' my={2}>
                                <LinkOverlay href='https://bluebubbles.app/donate' target='_blank'>
                                    Support Us
                                </LinkOverlay>
                            </Heading>
                            <Text>
                                Xcelerate Management was created and is currently run by independent engineers in their free time.
                                Any sort of support is greatly appreciated! This can be monetary, or just a review.
                            </Text>
                        </LinkBox>
                    </WrapItem>
                </Wrap>
            </Box>
        </SlideFade>
    );
};