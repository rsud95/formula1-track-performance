import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@mantine/core/styles.css'
import { Center, createTheme, MantineProvider, Autocomplete, Box, Container, Typography } from '@mantine/core';
import { fetchDrivers } from '../api/dataviewerService'

const theme = createTheme({
  fontFamily: 'Open Sans, sans-serif',
  primaryColor: 'cyan',
});

function App() {
  const [count, setCount] = useState(0);
  const [driverList, setDrivers] = useState(null);
  const [driversFetched, setDriversFetched] = useState(false)

  const baseURL = 'https://api.jolpi.ca'

  useEffect(() => {
    const updateDrivers = async () => {
      if(!driversFetched) {
        setDrivers(await fetchDrivers(baseURL));
        setDriversFetched(true);
      }
    }
    updateDrivers();
    console.log(driverList);
  });

  return (
    <MantineProvider theme={theme}>
      <>
        <Container size="responsive">
          <Box>
            <h1>F1 Driver Historical Performance per Track</h1>
          </Box>
          <Center>
            <Box w={300}>
              <Autocomplete
                label="Driver Name Select"
                placeholder="Please enter a driver name"
                data={driverList}
              ></Autocomplete>
            </Box>
          </Center>
        </Container>
      </>
    </MantineProvider>
  )
}

export default App
