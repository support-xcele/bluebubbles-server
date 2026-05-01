import React, { useEffect, useRef, useState } from 'react';
import { ipcRenderer } from 'electron';
import {
    Spacer,
    Box,
    Badge,
    Text,
    SkeletonText
} from '@chakra-ui/react';
import { animate, useReducedMotion } from 'framer-motion';
import { formatNumber } from 'app/utils/NumberUtils';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setStat } from '../../slices/StatsSlice';
import { TotalMessagesStatBox } from './TotalMessagesStatBox';
import { TopGroupStatBox } from './TopGroupStatBox';
import { BestFriendStatBox } from './BestFriendStatBox';
import { DailyMessagesStatBox } from './DailyMessagesStatBox';
import { TotalPicturesStatBox } from './TotalPicturesStatBox';
import { TotalVideosStatBox } from './TotalVideosStatBox';
import { StatValue } from './types';
import { useTimeout } from 'app/hooks/UseTimeout';
import { useInterval } from 'app/hooks/UseInterval';


const updateCache: { [key: string]: number } = {};

/**
 * Checks if an updatable statbox should update
 *
 * @param statName - The name of the stat to update
 * @param updateInterval - How often the stat should update
 * @returns Boolean
 */
const shouldUpdate = (statName: string, updateInterval: number) => {
    // If we've never updated before, we should update
    if (!Object.keys(updateCache).includes(statName)) return true;

    // Pull out the last check data
    const lastCheck = updateCache[statName];

    // If we haven't checked within the update interval, we should check.
    // Include a 500ms tolerance
    if ((new Date().getTime()) - lastCheck >= updateInterval - 500) return true;

    return false;
};


export const UpdatableStatBox = (
    {
        title,
        color,
        statName,
        ipcEvent,
        args = null,
        transform = null,
        condition = null,
        dispatchOverride = null,
        autoUpdate = true,
        updateInterval = 60000,
        delay = 0,
        pastDays = null
    }:
    {
        title: string,
        color: string,
        ipcEvent: string,
        statName: string,
        args?: null | (() => NodeJS.Dict<any> | null),
        transform?: null | ((value: any) => StatValue | Promise<StatValue>),
        condition?: null | ((value: any) => boolean),
        dispatchOverride?: null | ((value: any) => void),
        autoUpdate?: boolean,
        updateInterval?: number,
        delay?: number,
        pastDays?: number | null
    }
): JSX.Element => {
    const dispatch = useAppDispatch();
    const stat: string | number | null = useAppSelector(state => state.statistics[statName]) ?? null;
    
    /**
     * Function called to update the the statistic via an IPC call,
     * then update the stat in the redux slice.
     */
    const updateStat = (force = false) => {
        if (!force && !shouldUpdate(statName, updateInterval)) return;

        // Update the cache with the last time we've checked
        updateCache[statName] = new Date().getTime();

        // Fetch the stat and dispatch the results to listeners
        let finalArgs = args ? args() : null;
        if (pastDays && pastDays > 0) {
            if (!finalArgs) finalArgs = {};
            finalArgs.after = new Date(new Date().getTime() - (pastDays * 86_400_000));
        }

        ipcRenderer.invoke(ipcEvent, finalArgs).then(async (value) => {
            // If we want to transform the value in any way, do it
            if (transform) {
                const result = transform(value);
                value = (result instanceof Promise) ? await result : result;
            }

            // If we have a condition, and the condition fails,
            // don't update the stat
            if (condition && !condition(value)) return;

            // Update the stat
            if (dispatchOverride) {
                dispatchOverride(value);
            } else {
                dispatch(setStat({ name: statName, value }));
            }
        });
    };

    useTimeout(updateStat, delay);

    if (autoUpdate) {
        useInterval(updateStat, updateInterval);
    }

    useEffect(() => {
        updateStat(true);
    }, [pastDays]);

    return <StatBox title={title} text={stat} color={color} />;
};


const AnimatedNumber = ({ value }: { value: number }): JSX.Element => {
    const reduce = useReducedMotion();
    const [display, setDisplay] = useState<number>(reduce ? value : 0);
    const ref = useRef<number>(value);

    useEffect(() => {
        if (reduce) {
            setDisplay(value);
            return;
        }
        const from = ref.current === value ? 0 : ref.current;
        const controls = animate(from, value, {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
            onUpdate: (latest) => setDisplay(Math.round(latest))
        });
        ref.current = value;
        return () => controls.stop();
    }, [value, reduce]);

    return <>{formatNumber(display)}</>;
};


export const StatBox = (
    { title, text, color }:
    { title: string, text: string | number | null, color: string }
): JSX.Element => {
    return (
        <Box {...({ variant: 'glass' } as any)} maxW='sm' borderRadius='14px' overflow='hidden' p={5} m={1}>
            <Badge borderRadius='full' px='2' colorScheme={color} mb={2}>
                {title}
            </Badge>
            <Spacer />
            <Box
                color='gray.500'
                fontWeight='semibold'
                letterSpacing='wide'
            >
                {(text === null) ? (
                    <SkeletonText height={20} mt={2} noOfLines={2} />
                ) : (
                    (typeof(text) === 'number') ? (
                        <Text fontSize='2vw'><AnimatedNumber value={text} /></Text>
                    ) : (
                        <Text fontSize='2vw'>{text}</Text>
                    )
                )}
            </Box>
        </Box>
    );
};


export {
    TopGroupStatBox,
    TotalMessagesStatBox,
    BestFriendStatBox,
    DailyMessagesStatBox,
    TotalPicturesStatBox,
    TotalVideosStatBox
};