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
        const trackList = await fetch(baseURL + `/ergast/f1/drivers/${driverID}/circuits?limit=100`, {
            method:'GET',
            headers: {
                'Accept' : 'application/json'
            }
        })

        if(!trackList.ok) {
            throw new Error(`Server error. Response code ${trackList.status}`)
        };

        const unfilteredTracks = await trackList.json();
        for (let i = 0; i < unfilteredTracks.MRData.total; i++) {
            tracks.set(unfilteredTracks.MRData.CircuitTable.Circuits[i].circuitId, unfilteredTracks.MRData.CircuitTable.Circuits[i].circuitName)
        }

    } catch (error) {
        console.error("Error during track list retrieval", error);
        throw error;
    }
    return tracks;
};

export const fetchRaceResults = async(baseURL, season, driverID, round, constructor) => {
    let finishPositions = {
        finishingPos: null,
        teamMateName: null,
        teamMateGrid: null,
        teamMateFinish: null,
    };
    console.log('attempting race lookup')
    console.log(constructor)
    try {
        const raceResults = await fetch(baseURL + `/ergast/f1/${season}/${round}/results/`, {
            method:'GET',
            headers: {
                'Accept' : 'application/json'
            }
        })

        if(!raceResults.ok) {
            throw new Error(`Server error. Response code ${raceResults.status}`)
        };

        let unfilteredRace = await raceResults.json();
        
        console.log(unfilteredRace)

        // Find the chosen driver's race result (filter by driverID)
        for(let i = 0; i < unfilteredRace.MRData.RaceTable.Races[0].Results.length; i++) {
            console.log('per race loop')
            if (unfilteredRace.MRData.RaceTable.Races[0].Results[i].Constructor.constructorId === constructor) {
                console.log('match found');
                // possibly driver or team mate found
                if (unfilteredRace.MRData.RaceTable.Races[0].Results[i].Driver.driverId === driverID) {
                    // our driver has been found, retrieve race results
                    console.log('driver found')
                    finishPositions.finishingPos = unfilteredRace.MRData.RaceTable.Races[0].Results[i].positionText;
                } else {
                    // team mate found, retrieve start pos, finish pos, name
                    console.log('team mate found')
                    finishPositions.teamMateName = unfilteredRace.MRData.RaceTable.Races[0].Results[i].Driver.givenName + ' ' + unfilteredRace.MRData.RaceTable.Races[0].Results[i].Driver.familyName;
                    finishPositions.teamMateGrid = unfilteredRace.MRData.RaceTable.Races[0].Results[i].grid;
                    finishPositions.teamMateFinish = unfilteredRace.MRData.RaceTable.Races[0].Results[i].positionText;
                }
            }
        }
    } catch (error) {
        console.error("Error during qualifying result retrieval", error);
        throw error;
    };
    return finishPositions;
}

export const fetchQualiResults = async(baseURL, driverID, trackID) => {
    const qualiPerformance = {
        caption: `Historical Qualifying Performances`,
        head: ['Year', 'Constructor', 'Position', 'Time', 'Team Mate', 'Team Mate Position'],
        body: [],
    };

    const racePerformance = {
        caption: `Historical Race Performances`,
        head: ['Year', 'Constructor', 'Position', 'Team Mate', 'Team Mate Position'],
        body: [],
    }
    let resultLimitReached = false;
    let n = 0;
    while(!resultLimitReached) {
        try {
            const qualiResults = await fetch(baseURL + `/ergast/f1/drivers/${driverID}/qualifying/?limit=100&offset=${n}00`, {
                method:'GET',
                headers: {
                    'Accept' : 'application/json'
                }
            })

            if(!qualiResults.ok) {
                throw new Error(`Server error. Response code ${qualiResults.status}`)
            };

            let unfilteredQuali = await qualiResults.json();

            for (let i = 0; i < unfilteredQuali.MRData.RaceTable.Races.length; i++) {
                if (unfilteredQuali.MRData.RaceTable.Races[i].Circuit.circuitId === trackID) {

                    // Check which Qualifying stage was reached
                    let qualiStage = 'Q1';
                    if("Q3" in unfilteredQuali.MRData.RaceTable.Races[i].QualifyingResults[0]) {
                        qualiStage = 'Q3'
                    } else if ("Q2" in unfilteredQuali.MRData.RaceTable.Races[i].QualifyingResults[0]) {
                        qualiStage = 'Q2'
                    }

                    // Race results API call
                    let raceResults = await fetchRaceResults(baseURL, unfilteredQuali.MRData.RaceTable.Races[i].season, driverID,
                        unfilteredQuali.MRData.RaceTable.Races[i].round,
                        unfilteredQuali.MRData.RaceTable.Races[i].QualifyingResults[0].Constructor.constructorId,
                    )

                    qualiPerformance.body.push([unfilteredQuali.MRData.RaceTable.Races[i].season,
                    unfilteredQuali.MRData.RaceTable.Races[i].QualifyingResults[0].Constructor.name,
                    unfilteredQuali.MRData.RaceTable.Races[i].QualifyingResults[0].position,
                    unfilteredQuali.MRData.RaceTable.Races[i].QualifyingResults[0][qualiStage],
                    raceResults.teamMateName,
                    raceResults.teamMateGrid,
                    ]);
                    
                    racePerformance.body.push([unfilteredQuali.MRData.RaceTable.Races[i].season,
                    unfilteredQuali.MRData.RaceTable.Races[i].QualifyingResults[0].Constructor.name,
                    raceResults.finishingPos,
                    raceResults.teamMateName,
                    raceResults.teamMateFinish,
                    ])};
            }
            if (n * 100 > unfilteredQuali.MRData.total) {
                resultLimitReached = true;
            } else {
                n += 1;
            }

        } catch (error) {
            console.error("Error during qualifying result retrieval", error);
            throw error;
        };
    }
    return {
        quali: qualiPerformance,
        race: racePerformance,
    };
}