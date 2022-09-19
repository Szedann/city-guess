import ReactMapboxGl, {  Marker } from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useState } from 'react';
//@ts-expect-error
import {ReactComponent as SettingsIcon} from './settings-icon.svg'
const Map = ReactMapboxGl({
  accessToken:
    'pk.eyJ1Ijoic3plZGFubiIsImEiOiJja214YWxtczIwbGl5MnBwZnhtaXR2bTVsIn0.HHNsdy_93e7bHl9yN2k_jg'
});
interface City{
  names:[string, ...string[]];
  coordinates:[number, number];
}

function App() {
  const [displayOptionsCard, setDisplayOptionCard] = useState(true)
  const [options, setOptions] = useState({
    country: '',
    amount: 0
  })
  const [cityList, setCityList] = useState([])
  useEffect(()=>{
   (async () => {
     const url = `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&lang=PL&rows=${options.amount}&sort=population&facet=feature_code${options.country?"&q=cou_name_en%3D%22"+options.country+"%22":""}`
     let data = await (await fetch(url)).json()
     let count = 0
      while(!data.records.length && count<5){
          data = await (await fetch(url)).json()
          count++
      }
      //@ts-expect-error
      setCityList(data.records.map(cityRecord=>{
        const city:City = {
          names:[cityRecord.fields.name, ...(cityRecord.fields.alternate_names||'').split(',')],
          coordinates: cityRecord.fields.coordinates.reverse()
        }
        return city
      }))
    })()
  },[options])
  const [city, setCity] = useState({names:['null island'],coordinates:[0,0]} as City)
  const [points, setPoints] = useState(0)
  const [nameFieldValue, setNameFieldValue] = useState('')
  const nextCity = ()=>{
    const correct = city.names.findIndex(name=>name.trim().toLocaleLowerCase() === nameFieldValue.trim().toLocaleLowerCase()) >= 0
    
    if(city.names[0] !== 'null island'){
      setPreviousCities([...previousCities, {...city, correct}])
      if(correct){
        setPoints(points+1)
      }else{
        setPoints(points-1)
      }
    }
    let next = cityList[Math.floor(Math.random()*cityList.length)] || city
    do{
      next = cityList[Math.floor(Math.random()*cityList.length)] || city
    }while(next === city && cityList.length)
    setCity(next)
  }
  const nameFieldChange = (event:React.FormEvent<HTMLInputElement>)=>{
    setNameFieldValue(event.currentTarget.value)
  }
  const keyUp=(event:React.KeyboardEvent<HTMLInputElement>)=>{
    if(event.key === 'Enter'){ 
      setNameFieldValue('')
      nextCity()
    }
  }

  const [previousCities, setPreviousCities] = useState([] as (City & {correct:Boolean})[])

  useEffect(()=>{
    nextCity()
    setPreviousCities([])
    setPoints(0)
  },[cityList])

  const [formData, setFormData] = useState({country: '', amount: 10})
  return (
    <div className="App">
      {displayOptionsCard ? (
        <div className='optionsCard'>
          <div className='optionsWrapper'>
            Country:
            <input type="text" placeholder='The Entire World' value={formData.country} onChange={(e:React.FormEvent<HTMLInputElement>)=>{
              setFormData({...formData, country: e.currentTarget.value})
            }}/>
            Amount of cities:
            <input type="number" value={formData.amount} onChange={(e:React.FormEvent<HTMLInputElement>)=>{
              setFormData({...formData, amount: parseInt(e.currentTarget.value)})
            }} />
            <input type="button" value="Apply settings" onClick={()=>{setOptions(formData); setDisplayOptionCard(false)}} />
          </div>
        </div>
      ) : (
        <div className='optionsButton' onClick={()=>{setDisplayOptionCard(true)}}>
          <SettingsIcon width="2rem" height="2rem" />
        </div>
      )}
      <div className="PreviousCities">
        <h4>Points: {points}</h4>
        {/* <h4>Last cities:</h4> */}
        <div className="list">
          {previousCities.slice(0).reverse().map(city=>{
            return <div className={`prevCity ${city.correct?'correct':'incorrect'}`}>{city.names[0]}</div>
          })}
        </div>
      </div>
      <input type="text" name="cityName" className='cityNameInput' placeholder='City name' value={nameFieldValue} onChange={nameFieldChange} autoComplete="new-city" onKeyUp={keyUp}/>
      <Map style="mapbox://styles/szedann/cl15c717c000716o0ug0gcbzb" containerStyle={{width:'100vw', height:'100vh'}} renderChildrenInPortal={true} center={city.coordinates}>
        <Marker coordinates={city.coordinates} className="marker"></Marker>
      </Map>
    </div>
  );
}

export default App;
