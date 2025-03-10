import { Stack, MultiSelect, Checkbox, Group, Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { DateTimePicker } from "@mantine/dates";
import { useDispatch, useSelector } from "react-redux";
import { updateStartDate } from "../../actions/startDateAction";
import { updateEndDate } from "../../actions/endDateAction";
import { updateSlideshowScreens } from "../../actions/slideshowScreenActions";
import '@mantine/dates/styles.css';
import dateStyle from "../../style/DateModal.module.css";
import { updateBgColor, updateImageDescription, updateImageLink, updateTextColor, updateTextPosition } from "../../actions/imageActions";
import {showNotification, updateNotification} from "@mantine/notifications";
import {IconCheck, IconX} from "@tabler/icons-react";

export default function SlideshowModal({closeContinue}) {
    const [screens, setScreens] = useState([]); // Holds screen options for MultiSelect
    const [selectedScreens, setSelectedScreens] = useState([]); // Selected screens state
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startDateError, setStartDateError] = useState(null); // State for error message
    const token = localStorage.getItem('token');
    const dispatch = useDispatch();
    const API_URL = process.env.REACT_APP_API_URL;

    const reduxSelectedScreens = useSelector((state) => state.screens.screens || []); 
    const reduxStartDate = useSelector((state) => state.startDate.startDate || null);
    const reduxEndDate = useSelector((state) => state.endDate.endDate || null); 
    const slideData = useSelector((state) => state.imageLinks)

    useEffect(() => {
        fetchScreens();
    }, []);

    useEffect(() => {
        if (reduxSelectedScreens.length > 0) { 
            setSelectedScreens(reduxSelectedScreens); 
        }
    }, [reduxSelectedScreens]); 

    useEffect(() => {
        if (reduxStartDate) {
            setStartDate(new Date(reduxStartDate)); 
        }
        if (reduxEndDate) {
            setEndDate(new Date(reduxEndDate)); 
        }
    }, [reduxStartDate, reduxEndDate]); 

    useEffect(() => {
        dispatch(updateSlideshowScreens(selectedScreens));
    }, [selectedScreens, dispatch]);

    useEffect(() => {
        dispatch(updateStartDate(startDate));
        if (startDate && endDate && endDate <= startDate) {
            setStartDateError("Sākuma datumam jābūt pirms beigu datumam");
        } else {
            setStartDateError(null);
        }
    }, [startDate, endDate, dispatch]);

    useEffect(() => {
        dispatch(updateEndDate(endDate));
    }, [endDate, dispatch]);

    const fetchScreens = async () => {
        try {
            const response = await fetch(`${API_URL}/getAllScreens`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                showNotification({
                    id: "fetching",
                    color: 'red',
                    autoClose: false,
                    title: "Radās kļūda atlasot ekrānus.",
                    loading: false,
                    icon: <IconX size={18} />
                });
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            const transformedData = data
                .map(screen => ({
                    value: String(screen.id), 
                    label: screen.table_name 
                }))
                .sort((a, b) => a.label.localeCompare(b.label)); 

            setScreens(transformedData);
        } catch (error) {
            showNotification({
                id: "fetching",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda atlasot failus.",
                loading: false,
                icon: <IconX size={18} />
            });
            console.error('Error fetching screens:', error);
        }
    };

    const handleMultiSelectChange = (values) => {
        setSelectedScreens(values);
    };

    const handleSelectAllChange = (event) => {
        if (event.currentTarget.checked) {
            setSelectedScreens(screens.map(screen => screen.value)); 
        } else {
            setSelectedScreens([]); 
        }
    };
    const prepareDataForPost = () => {
        const combinedData = slideData.map(imageLink => ({
            ...imageLink,
            startDate: reduxStartDate,
            endDate: reduxEndDate,
            selectedScreens: reduxSelectedScreens
        }));

        console.log("Combined Data for POST:", combinedData);
        return combinedData;
    };

    const postDataToApi = async () => {
        const dataToPost = prepareDataForPost();

        try {
            showNotification({
                id: 'uploading',
                autoClose: false,
                title: "Saglabā slaidrādi...",
                loading: true
            });
            const response = await fetch(`${API_URL}/api/saveSlides`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(dataToPost),
            });

            if (!response.ok) {
                updateNotification({
                    id: "uploading",
                    color: 'red',
                    autoClose: false,
                    title: "Radās kļūda saglabāhot slaidrādi.",
                    loading: false,
                    icon: <IconX size={18} />
                });
                throw new Error('Failed to post data');
            }
            updateNotification({
                id: "uploading",
                color: 'teal',
                autoClose: true,
                title: "Slaidrāde saglabāta veiksmīgi!",
                loading: false,
                icon: <IconCheck size={18} />
            });
            const responseData = await response.json();
            if(responseData.message === "Slides created successfully"){
                closeContinue()
                dispatch(updateEndDate(''));
                dispatch(updateStartDate(''));
                dispatch(updateSlideshowScreens(''))
                dispatch(updateTextPosition('middle-center'))
                dispatch(updateTextColor('rgba(255, 255, 255, 1)'))
                dispatch(updateBgColor('rgba(40,34,98,1)'))
                dispatch(updateImageDescription(''))
                dispatch(updateImageLink(''))
                dispatch(updateSlideshowScreens([]))
                setStartDate('')
                setEndDate('')
                setSelectedScreens([])
            }
            console.log(responseData);

        } catch (error) {
            updateNotification({
                id: "uploading",
                color: 'red',
                autoClose: false,
                title: "Radās kļūda saglabājot slaidrādi.",
                loading: false,
                icon: <IconX size={18} />
            });
            console.error('Error posting data:', error);
        }
    };

    const isButtonDisabled = !startDate || !endDate || selectedScreens.length === 0 || !!startDateError;

    return (
        <Stack align="stretch" gap="md">
            <MultiSelect
                maxDropdownHeight={250}
                required
                label="Izvēlies ekrānus"
                placeholder="Izvēlies ekrānu"
                data={screens}
                searchable
                clearable
                nothingFoundMessage="Tāda ekrāna nav"
                value={selectedScreens}
                onChange={handleMultiSelectChange}
                variant="filled"
            />
            <Checkbox
                label="Izvēlēties visus ekrānus"
                variant="outline"
                checked={selectedScreens.length === screens.length} 
                onChange={handleSelectAllChange} 
            />
            <Group justify="space-between">
                <DateTimePicker
                    clearable
                    required
                    locale="lv"
                    classNames={{ root: dateStyle.dateWidth, label: dateStyle.textLeft }}
                    minDate={new Date()}
                    value={startDate}
                    onChange={setStartDate}
                    label="Sākuma datums"
                    placeholder="Izvēlies sākuma datumu"
                    variant="filled"
                    highlightToday
                    error={startDateError} 
                />

                <DateTimePicker
                    clearable
                    required
                    classNames={{ root: dateStyle.dateWidth, label: dateStyle.textRight }}
                    minDate={startDate} 
                    value={endDate}
                    onChange={setEndDate}
                    label="Beigu datums"
                    placeholder="Izvēlies beigu datumu"
                    variant="filled"
                    disabled={!startDate}

                />
            </Group>
            <Button disabled={isButtonDisabled} onClick={() => postDataToApi()}>
                Izveidot slaidrādi
            </Button>
        </Stack>
    );
}
