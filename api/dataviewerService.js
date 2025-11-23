/**
Functions to make calls to F1 ergast open API
to retrieve relevant data
**/

/** API Limit is 100 drivers per GET request 
 * so repeat 9 times to get all drivers
 * FUTURE: Implement a cache since new drivers aren't added often**/

export const fetchDrivers = async (baseURL) => {
    let names = new Map();
    for (let n = 0; n < 9; n++) {
        try {
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
            let fullName = '';
            for (let i = 0; i < unfilteredData.MRData.DriverTable.Drivers.length; i++) {
                fullName = unfilteredData.MRData.DriverTable.Drivers[i].givenName + ' ' + unfilteredData.MRData.DriverTable.Drivers[i].familyName
                names.set(unfilteredData.MRData.DriverTable.Drivers[i].driverId, fullName)
            }
        } catch (error) {
            console.error("Error during driver list retrieval:", error);
            throw error;
        }
    }
    return names
}

/* Fetch circuitName and circuitIDs that the requested driver has participated in
using a specific API route
Set API Limit to 100 to ensure only a single API call)
API route /ergast/f1/drivers/driverID/circuits*/

export const fetchTracks = async (baseURL, driverID) => {
    let tracks = new Map();
    try {
        console.log(`Driver id is ${driverID}`);
        const trackList = await fetch(baseURL + `/ergast/f1/drivers/${driverID}/circuits?limit=100`, {
            method:'GET',
            headers: {
                'Accept' : 'application/json'
            }
        })

        if(!trackList.ok) {
            throw new Error(`Server error. Response code ${driverList.status}`)
        };

        const unfilteredTracks = await trackList.json();
        console.log(unfilteredTracks)
        for (let i = 0; i < unfilteredTracks.MRData.total; i++) {
            tracks.set(unfilteredTracks.MRData.CircuitTable.Circuits[i].circuitId, unfilteredTracks.MRData.CircuitTable.Circuits[i].circuitName)
        }

    } catch (error) {
        console.error("Error during track list retrieval", error);
        throw error;
    }
    console.log(tracks);
    return tracks;
};