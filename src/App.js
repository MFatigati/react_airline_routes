import React, { Component, useEffect, useState } from 'react';
import './App.css';
import data from './data'

const Map = ({routes}) => {
  function codeToLat(code) {
    return data.airports.filter(record => record.code === code)[0].lat;
  }

  function codeToLong(code) {
    return data.airports.filter(record => record.code === code)[0].long;
  }

  return (
    <svg className="map" viewBox="-180 -90 360 180">
  <g transform="scale(1 -1)">
    <image xlinkHref="equirectangular_world.jpg" href="equirectangular_world.jpg" x="-180" y="-90" height="100%" width="100%" transform="scale(1 -1)"/>
    
    {routes.map(route => {
      let y1 = codeToLat(route.src);
      let x1 = codeToLong(route.src);
      let y2 = codeToLat(route.dest);
      let x2 = codeToLong(route.dest);
      return (
        <g key="">
        <circle className="source" cx={x1} cy={y1}>
          <title></title>
        </circle> 
        <circle className="destination" cx={x2} cy={y2}>
          <title></title>
        </circle>
        <path d={`M${x1} ${y1} L ${x2} ${y2}`} />
      </g>
      )
    })}
   
  </g>
</svg>
  )
}

const RouteTable = ({columns, format, className, rows, filteredData}) => {
  return (
    <table className={className}>
      <thead><tr><th>{columns[0].name}</th><th>{columns[1].name}</th><th>{columns[2].name}</th></tr></thead>
      <tbody>
        {filteredData.slice(rows[0], rows[1] + 1).map(route => {return (
          <tr key={`${route.src}-${route.dest}`}>
            <td>{format(columns[0].property, route.airline)}</td>
            <td>{format(columns[1].property, route.src)}</td>
            <td>{format(columns[2].property, route.dest)}</td>
          </tr>
        )})}
      </tbody>
    </table>
  )
}

const SelectAirlineList = ({options, allTitle, onSelect}) => {
  
  return (
    <select onChange={onSelect}>
      <option value={allTitle}>{allTitle}</option>
      {options.map(option => <option value={option.name} key={option.name}>{option.name}</option>)}
    </select>
    )
  }

const SelectAirportList = ({options, allTitle, onSelect}) => {
  return (
    <select onChange={onSelect}> 
      <option value={allTitle}>{allTitle}</option>
      {options.map(airport => <option value={airport.name} key={airport.code}>{airport.name}</option>)}
    </select>
  )
}

const App = () => {
  const [rows, updateRows] = useState([0, 24]);
  const [previousDisabled, disablePrevious] = useState(true);
  const [nextDisabled, disableNext] = useState(false);
  const [selectedAirline, updateAirline] = useState("All Airlines");
  const [selectedAirport, updateAirport] = useState("All Airports");
  const [filteredData, updateFilteredData] = useState(data.routes);
  const [filteredAirlines, updateAirlines] = useState(data.airlines);
  const [filteredAirports, updateAirports] = useState(data.airports);
  const [dataChunks, updateChunks] = useState(initializeChunks());
  const [currentChunk, updateCurrentChunk] = useState(0);


  useEffect(() => {
    filterData();
    updateCurrentChunk(0);
  }, [selectedAirport, selectedAirline]);

  useEffect(() => {
    let currentAirlines = data.airlines.filter(record => {
      for (let i = 0; i < filteredData.length; i++) {
        if (formatValue('airline', filteredData[i].airline) === record.name) {
          return true;
        }
      }
    });
    updateAirlines(currentAirlines);

    let currentAirports = data.airports.filter(record => {
      for (let i = 0; i < filteredData.length; i++) {
        if (formatValue('src', filteredData[i].src) === record.name || formatValue('dest', filteredData[i].dest) === record.name) {
          return true;
        }
      }
    });
    updateAirports(currentAirports);
    chunkData();
  }, [filteredData]);

  useEffect(() => {
    updateRows([currentChunk * 25, currentChunk * 25 + dataChunks[currentChunk].length - 1]);
    if (currentChunk >= dataChunks.length - 1) {
      disableNext(true);
    } else {
      disableNext(false);
    }
    if (currentChunk <= 0) {
      disablePrevious(true);
    } else {
      disablePrevious(false);
    }
  }, [dataChunks]);

  useEffect(() => {
    updateRows([currentChunk * 25, currentChunk * 25 + dataChunks[currentChunk].length - 1]);
  }, [currentChunk])

  // useEffect(() => {
    // if (currentChunk + 1 >= dataChunks.length - 1) {
    //   disableNext(true);
    //   disablePrevious(false);
    // }
    // if (currentChunk - 1 <= 0) {
    //   disablePrevious(true);
    //   disableNext(false);
    // }
  //   updateRows([0, 24]);
  // }, [dataChunks])



  // useEffect(() => {
  //   updateRows([currentChunk * 25, currentChunk * 25 + dataChunks[currentChunk].length - 1]);
  // }, [currentChunk]);

  function chunkData() {
    let chunked = [];
    for (let i = 0; i < filteredData.length; i += 25) {
      chunked.push(filteredData.slice(i, i + 25));
    }
    updateChunks(chunked);
  }

  function initializeChunks() {
    let chunked = [];
    for (let i = 0; i < filteredData.length; i += 25) {
      chunked.push(filteredData.slice(i, i + 25));
    }
    return chunked;
  }

  // function handlePrevious() {
  //   if (rows[0] - 25 <= 0) {
  //     disablePrevious(true);
  //     disableNext(false);
  //   } else {
  //     disablePrevious(false);
  //     disableNext(false);
  //   }
  //   if (rows[0] !== 0) {
  //     updateRows([rows[0] - 25, rows[1] - 25]);
  //   }
  // }

  // function handleNext() {
  //   if (rows[1] + 25 >= filteredData.length - 1) {
  //     disableNext(true);
  //     disablePrevious(false);
  //   } else {
  //     disableNext(false);
  //     disablePrevious(false);
  //   }
  //   if (rows[1] < filteredData.length - 25) {
  //     updateRows([rows[0] + 25, rows[1] + 25]);
  //   }
  // }

  function handlePrevious() {
    if (currentChunk - 1 <= 0) {
      disablePrevious(true);
      disableNext(false);
    } else {
      disablePrevious(false);
      disableNext(false);
    }
    updateCurrentChunk(currentChunk - 1);
  }

  function handleNext() {
    if (currentChunk + 1 >= dataChunks.length - 1) {
      disableNext(true);
      disablePrevious(false);
    } else {
      disableNext(false);
      disablePrevious(false);
    }
    updateCurrentChunk(currentChunk + 1);
  }

  function filterData() {
    if (selectedAirline === "All Airlines" && selectedAirport === "All Airports") {
      updateFilteredData(data.routes);
      // updateRows([0, 24]);
    } else if (selectedAirline === "All Airlines") {
      updateFilteredData(data.routes.filter(record => {
        return formatValue('src', record.src) === selectedAirport || formatValue('dest', record.dest) === selectedAirport
      }));
      // updateRows([0, 24]);
    } else if (selectedAirport === "All Airports") {
      updateFilteredData(data.routes.filter(record => formatValue('airline', record.airline) === selectedAirline));
      // updateRows([0, 24]);
    } else {
      updateFilteredData(data.routes.filter(record => {
        return (formatValue('airline', record.airline) === selectedAirline && (formatValue('src', record.src) === selectedAirport || formatValue('dest', record.dest) === selectedAirport))
      }));
      // updateRows([0, 24]);
    }
  }

  function handleSelectAirline(event) {
    updateAirline(event.target.value);
  }

  function handleSelectAirport(event) {
    updateAirport(event.target.value);
  }

  const columns = [
    {name: 'Airline', property: 'airline'},
    {name: 'Source Airport', property: 'src'},
    {name: 'Destination Airport', property: 'dest'},
  ];

  function formatValue(property, value) {
    switch (property) {
      case 'airline':
        return data.getAirlineById(value);
      case 'src':
        return data.getAirportByCode(value);
      case 'dest':
        return data.getAirportByCode(value);
    }
  }

  function resetRoutes() {
    updateFilteredData(data.routes);
  }

  return (
    <div className="app">
    <header className="header">
      <h1 className="title">Airline Routes</h1>
    </header>
    <section>
      <Map routes={filteredData}/><hr/>
      Show routes on <SelectAirlineList options={filteredAirlines} valueKey="id" titleKey="name"
  allTitle="All Airlines" value="" onSelect={handleSelectAirline}/> flying in or out of <SelectAirportList options={filteredAirports} valueKey="id" titleKey="name"
  allTitle="All Airports" value="" onSelect={handleSelectAirport}/><button onClick={resetRoutes}>Show all routes</button>
      <hr/>
      <RouteTable className="routes-table" columns={columns} rows={rows} format={formatValue} filteredData={filteredData}/>
      <p>{`Showing ${rows[0] + 1}-${rows[1] + 1} of ${filteredData.length} routes.`}</p>
      <button onClick={handlePrevious} disabled={previousDisabled}>Previous Page</button><button onClick={handleNext} disabled={nextDisabled}>Next Page</button>
    </section>
  </div>
  )
}

export default App;