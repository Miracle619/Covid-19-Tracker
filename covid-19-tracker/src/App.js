import React,{useState,useEffect} from 'react';
import './App.css';
import {Card,CardContent, MenuItem,FormControl,Select} from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import {sortData, prettyPrintStat} from './utils';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setcountries] = useState([]);
  const [country,setcountry] = useState(['worldwide']);
  const [countryInfo,setCountryInfo] =useState({});
  const [tableData,setTableData] = useState([]);  
  const [mapCenter,setMapCenter] = useState({ lat: 34.80746,lng: -40.4796 });
  const [mapzoom,setMapZoom]   = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  useEffect(()=>
{
  fetch("https://disease.sh/v3/covid-19/all")
  .then(response => response.json())
  .then (data => {
    setCountryInfo(data);
  });
},[]);

  
  useEffect(() => {
    //The code inside here will run once when the component loads not again!!.
    //async => send a request ,wait for it , do something with it!!.

    const getCountriesData = async()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=> response.json())
      .then((data)=>{
        const countries = data.map((country) =>(

        {
          name : country.country,   //INDIA,RUSSIA,UNITED STATE
          value : country.countryInfo.iso2  //UK,USA,FR,IND
        }));
        const sortedData = sortData(data);
        setTableData(sortedData);
        setcountries(countries);
        setMapCountries(data);
      });
    };
    getCountriesData();
  }, []);
  ///USEEFFECT = Run a pies of code base on a given condition
   // STATE = how to write a variable in REACT

  const onCountryChange =async (event) =>{
    const countryCode = event.target.value;
    // console.log(countryCode);
    setcountry(countryCode);

    const url = countryCode === "worldwide"
     ? "https://disease.sh/v3/covid-19/all"
     : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
     
     await fetch(url)
     .then (response => response.json())
     .then (data => {
        setcountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(3);
     })
  };

    console.log(countryInfo); 
  return (
   
    
    <div className="app">
      <div className="app__left">
        <div className="app__header">
            <h1>COVID-19 TRACKER</h1>      
            <FormControl className="app_dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
            <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                
                countries.map(country =>
                  
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                  )}
              
            </Select>
          </FormControl>
        </div>
        <div className="app_stats">
          <InfoBox 
          onClick={(e) => setCasesType("cases")}
          title = "CoronaVirus Cases" 
          isRed
            active={casesType === "cases"}        
          cases={prettyPrintStat(countryInfo.todayCases)}
          total={countryInfo.cases}/> 
          
          <InfoBox 
          onClick={(e) => setCasesType("recovered")}
          title = "Recovered"  
          active={casesType === "recovered"}
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={countryInfo.recovered}/> 
          
          <InfoBox
          onClick={(e) => setCasesType("deaths")}
          title = "Deaths"
          isRed
            active={casesType === "deaths"}
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={countryInfo.deaths}/>          
      </div>    
      <Map countries ={mapCountries }
      casesType={casesType}  
      center={mapCenter}
      zoom={mapzoom}
      />
    </div>
    <Card className="app__right">
        <CardContent>
          
            <h3>LIVE CASES BY COUNTRY</h3>
            <Table countries={tableData} />       
            <h3 className="app__graphTitle">Worldwide new  {casesType}</h3> 
            <LineGraph className="app__graph" casesType={casesType} />
          
                    
        </CardContent>          
    
    </Card>  
</div>
  );
}

export default App;
