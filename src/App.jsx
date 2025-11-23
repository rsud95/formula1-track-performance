import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mantine/core/styles.css'
import { Center, createTheme, MantineProvider, Autocomplete, Box, Container, Typography } from '@mantine/core';
import { fetchDrivers, fetchTracks } from '../api/dataviewerService'

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'cyan',
});

function App() {
  const [count, setCount] = useState(0);
  const [driverList, setDrivers] = useState([]);
  const [trackList, setTrackList] = useState([]);
  const [driversFetched, setDriversFetched] = useState(false);
  const [tracksFetched, setTracksFetched] = useState(false);
  const [driverSelected, setDriverSelection] = useState({id: null, selected: false});

  const baseURL = 'https://api.jolpi.ca'

  useEffect(() => {
    const updateDrivers = async () => {
      if(!driversFetched) {
        setDrivers(await fetchDrivers(baseURL));
        setDriversFetched(true);
      }
    }
    updateDrivers();
  });

  const handleDriverSelect = async (e) => {
    // Find corresponding ID
    let selectedID = driverList.keys().find(key => driverList.get(key) === e);
    setDriverSelection({id: selectedID, selected: true});
    setTrackList(await fetchTracks(baseURL, selectedID)
    ,setTracksFetched(true));
  }

  return (
    <MantineProvider theme={theme}>
      <>
        <Container size="responsive">
          <Box>
            <h1>F1 Driver Historical Performance per Track</h1>
          </Box>
          <Center>
            {driversFetched && <Box w={300}>
              <Autocomplete
                label="Driver Name Select"
                placeholder="Please enter a driver name"
                selectFirstOptionOnChange
                limit={100}
                data={[...driverList.values()]}
                onOptionSubmit={handleDriverSelect}
              ></Autocomplete>
              {driverSelected.selected && tracksFetched && <Autocomplete
                label="Select a track"
                selectFirstOptionOnChange
                data={[...trackList.values()]}
              ></Autocomplete>
              }
            </Box>
            }
          </Center>
        </Container>
      </>
    </MantineProvider>
  )
}

export default App
