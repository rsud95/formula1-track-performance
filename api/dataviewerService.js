/**
Functions to make calls to F1 ergast open API
to retrieve relevant data
**/

/** API Limit is 100 drivers per GET request 
 * so repeat 9 times to get all drivers
 * FUTURE: Implement a cache since new drivers aren't added often**/

export const fetchDrivers = async (baseURL) => {
    let names = [];
    for (let n = 0; n < 9; n++) {
        try {
            console.log(baseURL + '/ergast/f1/drivers/')
            const driverList = await fetch(baseURL + `/ergast/f1/drivers/?limit=100&offset=${n}00`, {
                method:'GET',
                headers: {
                    'Accept' : 'application/json',
                }
            });

            if(!driverList.ok) {
                throw new Error(`Server error. Response code ${driverList.status}`)
            };
            
            const unfilteredData = await driverList.json();
            console.log(unfilteredData.MRData.DriverTable.Drivers)
            let fullName = '';
            for (let i = 0; i < unfilteredData.MRData.DriverTable.Drivers.length; i++) {
                fullName = unfilteredData.MRData.DriverTable.Drivers[i].givenName + ' ' + unfilteredData.MRData.DriverTable.Drivers[i].familyName
                names.push(fullName)
            }
            console.log(names)
        } catch (error) {
            console.error("Error during driver list retrieval:", error);
            throw error;
        }
    }
    return names
}

/* Fetch list of tracks that the requested driver has participated in
using a specific API route
Set API Limit to 100 to ensure only a single API call)*/

export const fetchTracks = async (baseURL, driver) => {
    let tracks = [];
    try {
        const trackList = await fetch(baseURL + `/ergast/f1/drivers/`)
    } catch (error) {
        console.error("Error during track list retrieval", error);
    }
};