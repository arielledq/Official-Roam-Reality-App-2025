import React, { useEffect, useState } from 'react';
import AppText from '../text';
import theme from '../../assets/theme';
import { FontFamily, FontLineHeights, FontSizes, fontGroup } from "../../util/FontUtils"

let interval

const Timer = ({ callback }) => {
    const [time, setTime] = useState(180) // 3 minutes (180 seconds)
    useEffect(() => {
        interval = setInterval(() => {
            if (time === 0) {
                clearInterval(interval);
            } else {
                setTime((prevTime) => prevTime - 1);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (time === 0) {
            clearInterval(interval);
            callback && callback()
        }
    }, [time]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = (time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <AppText
            style={{
                lineHeight: FontLineHeights.LH25,
            }}
        >
            {`Code delivery in progress. Please wait for the timer to complete: `}
            <AppText
                style={{
                    color: theme.lightColors.blue,
                }}
            >
                {formatTime(time)}
            </AppText>
            {` Thank you for your patience.`}
        </AppText>
    );
};

export default Timer;
