import { useEffect, useState } from 'react';
import { Indicator, Box, Container, Grid, SimpleGrid, Skeleton, rem, Modal, Text, useMantineColorScheme } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import '@mantine/dates/styles.css';
import '@mantine/core/styles.css';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useDisclosure } from '@mantine/hooks';
import SingleDaySlidesModal from "./SingleDaySlidesModal";
import SystemData from "./SystemData";
import classes from "../../style/ViewSlides.module.css";
import { IconUpload, IconUsers } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

dayjs.extend(isBetween);
dayjs.locale('lv');
const PRIMARY_COL_HEIGHT = rem(300);

export default function ViewAllSlideshows() {
  const { colorScheme } = useMantineColorScheme();
  const [slideshows, setSlideshows] = useState([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeSlides, setActiveSlides] = useState([]);
  const [folderCount, setFolderCount] = useState(0);
  const [screenCount, setScreenCount] = useState(0);
  const [todaysSlidesCount, setTodaysSlidesCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
    const API_URL = process.env.REACT_APP_API_URL;
    const SECONDARY_COL_HEIGHT = `calc(${PRIMARY_COL_HEIGHT} / 2 - var(--mantine-spacing-md) / 2)`;

  useEffect(() => {
    async function fetchSlideshows() {
      try {
        const response = await fetch(`${API_URL}/api/getAllSlides`);
        const data = await response.json();
        setSlideshows(data);
        countTodaysSlides(data); 

        fetchScreens();
        fetchFolders();
        fetchUsers(); 

      } catch (error) {
        console.error('Error fetching slideshows:', error);
      }
    }

    async function fetchScreens() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/api/getAllScreens`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const screensData = await response.json();
        setScreenCount(screensData.length);
      } catch (error) {
        console.error('Error fetching screens:', error);
        setScreenCount(0);
      }
    }

    async function fetchFolders() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/api/listFolders`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const folderData = await response.json();
        setFolderCount(folderData.folders.length);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setFolderCount(0);
      }
    }

    async function fetchUsers() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/api/getAllUsers`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const userData = await response.json();
        if (userData.status === 200) {
          setUserCount(userData.users.length);
        } else {
          console.error('Error fetching users:', userData.message);
          setUserCount(0);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUserCount(0);
      }
    }

    const countTodaysSlides = (slides) => {
      const today = dayjs().startOf('day');
      const count = slides.filter(slide => {
        const startDate = dayjs(slide.startDate);
        const endDate = dayjs(slide.endDate);
        return today.isBetween(startDate, endDate, null, '[]');
      }).length;
      setTodaysSlidesCount(count);
    };

    fetchSlideshows();
  }, []);

  const getActiveSlideshowsForDay = (date) => {
    const startOfDay = dayjs(date).startOf('day');
    const endOfDay = dayjs(date).endOf('day');
    
    return slideshows.filter((slideshow) => {
      const startDate = dayjs(slideshow.startDate);
      const endDate = dayjs(slideshow.endDate);
      return startDate.isBefore(endOfDay) && endDate.isAfter(startOfDay);
    });
  };

  const handleDayClick = (date) => {
    const activeSlides = getActiveSlideshowsForDay(dayjs(date).startOf('day'));
    if (activeSlides.length > 0) {
      setSelectedDate(date);
      setActiveSlides(activeSlides);
      open();
    } else {
      console.log('No slideshows for this day:', date);
    }
  };

  return (
    <div className="slideshow-main">
      <Container my="md" w={900}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Box className={colorScheme === 'light' ? 'centerCalendar' : 'darkCalendar'}>
            <Text>Slaidrāžu grafiks</Text>
            <Calendar
              static
              renderDay={(date) => {
                const day = date.getDate();
                const activeSlides = getActiveSlideshowsForDay(date);
                const hasSlideshow = activeSlides.length > 0;

                return (
                  <div onClick={() => handleDayClick(date)} style={{ cursor: hasSlideshow ? 'pointer' : 'default' }}>
                    <Indicator size={6} color="red" offset={-2} disabled={!hasSlideshow}>
                      <div>{day}</div>
                    </Indicator>
                  </div>
                );
              }}
            />
          </Box>
          <Grid gutter="md">
            <Grid.Col>
              <SystemData
                folderCount={folderCount}
                screenCount={screenCount}
                slideCount={todaysSlidesCount}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Link to="/dashboard/viewAllUsers">
                <Box className='small-grid-box'>
                  <IconUsers color='white' size={30}/>
                  <Text color='white' ta='center' classNames={{root: classes.seperator}}>Lietotāju skaits:</Text>
                  <Text color='white' ta='center'>{userCount}</Text>
                </Box>
              </Link>
            </Grid.Col>
            <Grid.Col span={6}>
              <Link to="/dashboard/upload">
                <Box className={colorScheme === 'light' ? 'small-grid-box2' : 'small-grid-box-dark'}>
                  <IconUpload color={colorScheme === 'light' ? 'black' : 'white'} size={30}/>
                  <Text color={colorScheme === 'light' ? 'black' : 'white'} ta='center'>Augšupielādēt failus</Text>
                </Box>
              </Link>
            </Grid.Col>
          </Grid>
        </SimpleGrid>
      </Container>
      <Modal
        fullScreen={true}  
        centered
        opened={opened}
        onClose={close}
        title={`Slaidi priekš ${dayjs(selectedDate).format('MMMM D, YYYY')}`}
      >
        <SingleDaySlidesModal slides={activeSlides} />
      </Modal>
    </div>
  );
}
