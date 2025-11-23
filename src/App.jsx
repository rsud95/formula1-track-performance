import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mantine/core/styles.css'
import { Box, Center, createTheme, MantineProvider, LoadingOverlay, Autocomplete, Paper, Container, Space, Text, Title, Typography, Table, Tabs } from '@mantine/core';
import { fetchDrivers, fetchQualiResults, fetchTracks } from '../api/dataviewerService'
import { IconStopwatch, IconFlag } from '@tabler/icons-react'

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'cyan',
});

function App() {
  const [driverList, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [trackList, setTrackList] = useState([]);
  const [driversFetched, setDriversFetched] = useState(false);
  const [tracksFetched, setTracksFetched] = useState(false);
  const [driverSelected, setDriverSelection] = useState({id: null, selected: false});
  const [trackSelected, setTrackSelection] = useState({id: null, selected: false});
  const [qualiResults, setQualiResults] = useState(null);
  const [qualiFetched, setQualiResultsFetched] = useState(false);
  const [tabValue, setTabValue] = useState({qualifying: true, race: false});


  const baseURL = 'https://api.jolpi.ca'

  useEffect(() => {
    const updateDrivers = async () => {
      if(!driversFetched) {
        setDrivers(await fetchDrivers(baseURL));
        setIsLoading(false);
        setDriversFetched(true);
      }
    }
    updateDrivers();
  });

  const handleDriverSelect = async (e) => {
    setIsLoading(true);
    // Find corresponding ID
    let selectedID = driverList.keys().find(key => driverList.get(key) === e);
    setDriverSelection({id: selectedID, selected: true});
    setTrackList(await fetchTracks(baseURL, selectedID)
    ,setTracksFetched(true),
    setIsLoading(false));
  }

  const handleTrackSelect = async (e) => {
    setIsLoading(true);
    // Find corresponding track ID
    let selectedID = trackList.keys().find(key => trackList.get(key) === e);
    setTrackSelection({id: selectedID, selected: true});
    setQualiResults(await fetchQualiResults(baseURL, driverSelected.id, selectedID),
    setQualiResultsFetched(true),
    setIsLoading(false));
    console.log(qualiResults)
  }

  const handleTabChange = (e) => {
    // Set states for tabs
    e === 'qualifying' ? setTabValue({qualifying: true, race: false}) : setTabValue({qualifying: false, race: true})
  }

  return (
    <MantineProvider theme={theme}>
      <>
        <Container size="responsive">
          <Paper
          shadow='md'
          radius='md'
          withBorder
          p='xl'
          >
            <Title order={1}>
              F1 Driver Performance by Track
            </Title>
            <Space h="xs"/>
            <Text size='md'>
              The following site uses the open source <a href='https://github.com/jolpica/jolpica-f1/tree/main'>jolpi.ca</a> F1 API to retrieve historical race data, with a focus on a driver's performance across tracks over several years
            </Text>
            <Space h="xs"/>
            {isLoading && <LoadingOverlay
              visible={isLoading}
              overlayProps={{ radius: 'sm', blur: 2 }}
              loaderProps={{type: 'bars'}}/>
            }
            <Center>
              {driversFetched && <Box w={300}>
                <Autocomplete
                  label="Driver Name Select"
                  placeholder="Please enter a driver name"
                  selectFirstOptionOnChange
                  limit={100}
                  data={[...driverList.values()]}
                  onOptionSubmit={handleDriverSelect}
                />
                <Space h="xs"/>
                {driverSelected.selected && tracksFetched && <Autocomplete
                  label="Select a track"
                  placeholder="Please enter a track name"
                  selectFirstOptionOnChange
                  data={[...trackList.values()]}
                  onOptionSubmit={handleTrackSelect}
                />
                }
              </Box>
              }
            </Center>
              {qualiFetched && <Box>
                <Tabs
                  defaultValue="qualifying"
                  onChange={handleTabChange}
                >
                  <Tabs.List justify='Center'
                    grow='true'>
                    <Tabs.Tab
                    value="qualifying"
                    leftSection={<IconStopwatch/>}>
                      Qualifying
                    </Tabs.Tab>
                    <Tabs.Tab
                    value="race"
                    leftSection={<IconFlag/>}>
                      Race
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs>
                <Space h="xs"/>
                {tabValue.qualifying && <Table
                  captionSide='top'
                  striped='odd'
                  withColumnBorders
                  highlightOnHover='true'
                  ta='left'
                  data={qualiResults.quali}
                />
                }
                {tabValue.race && <Table
                  captionSide='top'
                  striped='odd'
                  withColumnBorders
                  highlightOnHover='true'
                  ta='left'
                  data={qualiResults.race}
                />
                }
              </Box>
            }
          </Paper>          
        </Container>
      </>
    </MantineProvider>
  )
}

export default App
