import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    this.FetchLocations();
  }

  day(d: number) {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[d%7];
  }

  weatherUri = 'api/weatherdatabase';
  locationUri = 'api/locationdatabase';

  weatherId = 0; // Ordernumber of weatherboxes.
  public selectedLocations = []; // Id's from selectbox
  public locations: Locations[] = []; // Location data from API.

   // For weather day select.
  locationId: number; 
  dayCount: number;

  // Collection of locations to be deleted.
  deletable = [];

  lastWdayId = 0; // Id for the weatherbox that was lastly selected before current.
  locationName = "";  // Name that is written on the addable location textbox.

  public daysToShow = 7;

  public date = new Date().toDateString();

  public AddWeatherInfo(temp: HTMLInputElement, rain: HTMLInputElement, wind: HTMLInputElement) {
    
    for (let i = 0; i < this.selectedLocations.length; i++) {

      if (!Array.isArray(this.locations[this.selectedLocations[i]].weatherOfDay)) {
        this.locations[this.selectedLocations[i]].weatherOfDay = [];
      }
      let day = new Date();
      
      this.locations[this.selectedLocations[i]].weatherOfDay.push({
        id: 0,  //Id is zero so that new id will be made at the database
        order: this.weatherId++,
        dayCount: this.locations[this.selectedLocations[i]].weatherOfDay.length,
        day: this.day((day.getDay() + this.locations[this.selectedLocations[i]].weatherOfDay.length)),
        temperature: parseInt(temp.value),
        rain: parseInt(rain.value),
        wind: parseInt(wind.value)
      });
    }
  }

  public EditTemperature(temp: HTMLInputElement) {
    this.locations[this.locationId].weatherOfDay[this.dayCount].temperature = parseInt((<HTMLInputElement>document.getElementById("temp")).value);
  }
  public EditRain(rain: HTMLInputElement) {
    this.locations[this.locationId].weatherOfDay[this.dayCount].rain = parseInt((<HTMLInputElement>document.getElementById("rain")).value);
  }
  public EditWind(wind: HTMLInputElement) {
    this.locations[this.locationId].weatherOfDay[this.dayCount].wind = parseInt((<HTMLInputElement>document.getElementById("wind")).value);
  }

  public HandleLocationSelect() {
    let l = this.selectedLocations.length;
    let selected:number;
    for (let i = 0; i < l; i++) {
      selected = this.selectedLocations[i];
      // id greater than 0 means that locations has been fetched from api so we can fetch the weathers.
      var id = this.locations[selected].id;
      if (!this.locations[selected].weatherOfDay.length && id) {
        this.FetchWeathers(id, selected);
      }
    }
  }

  public SetLocationName() {
    this.locationName = (<HTMLInputElement>document.getElementById("location")).value;
  }

  public AddLocation(location: string | null) {

    let locationName = this.locationName.length ? this.locationName : location;
    this.locations.push({
      id: 0,
      order: this.locations.length,
      name: locationName,
      weatherOfDay: []
    });
  }

  public async SaveAll() {
    await this.SaveLocations();
    await this.SaveWeathers();
    if (this.deletable.length) {
      this.DeleteAction();
    } 
  }

  public DeleteLocation() {
    let i = 0;
    this.deletable = [];
    console.log(this.locations[this.selectedLocations[0]].id);
    // Set initial values to all selected.
    for (i = 0; i < this.selectedLocations.length; i++) {

      if (this.locations[this.selectedLocations[i]].id > 0)
        this.deletable.push(
          {
            Id: this.locations[this.selectedLocations[i]].id
          });

      this.locations.splice(this.selectedLocations[i], 1, { order: 0, id: 0, name: "" });
    }
    // Pick all locations that has NOT initial values.
    this.locations = this.locations.filter((value) => {
      return value.name.length;
    })
    // Recount the order
    for (i = 0; i < this.locations.length; i++) this.locations[i].order = i;

    this.selectedLocations = [];
  }

  public SelectWeatherDay(locationId: number, dayCount: number, wdayId: number) {
    this.locationId = locationId;
    this.dayCount = dayCount;
    let tempField = (<HTMLInputElement>document.getElementById("temp"));
    let rainField = (<HTMLInputElement>document.getElementById("rain"));
    let windField = (<HTMLInputElement>document.getElementById("wind"));

    tempField.disabled = false;
    rainField.disabled = false;
    windField.disabled = false;
    // Put values of the selected day to the fields
    tempField.value = this.locations[locationId].weatherOfDay[dayCount].temperature.toString();
    rainField.value = this.locations[locationId].weatherOfDay[dayCount].rain.toString();
    windField.value = this.locations[locationId].weatherOfDay[dayCount].wind.toString();

    console.log(wdayId);
    // Indicate selection
    let lastSelected = (<HTMLHtmlElement>document.getElementById(this.lastWdayId + ''));
    if (lastSelected) lastSelected.style.cssText = "outline: 0px solid red";
    (<HTMLHtmlElement>document.getElementById(wdayId + '')).style.cssText = "outline: 1px solid red";
    this.lastWdayId = wdayId;
  }

  public FetchLocations() {
    this.weatherId = 0;
    fetch(this.locationUri)
      .then(response => response.json())
      .then(data => this.HandleLocations(data))
      .catch(error => console.error('Unable to get weathers.', error));
  }

  private HandleLocations(data: LocationDTO[]) {

    this.locations = [];
    console.log(data);
    for (let location of data) {
      this.locations.push({
        id: location.id,
        order: this.locations.length,
        name: location.name,
        weatherOfDay: []
      });
    }
  }

  public FetchWeathers(locationId: number, selectedLocation: number) {
    fetch(this.weatherUri+"/location/"+locationId)
      .then(response => response.json())
      .then(data => this.HandleWeathers(data, selectedLocation))
      .catch(error => console.error('Unable to get weathers.', error));
  }

  private HandleWeathers(data: WeatherDTO[], selectedLocation: number) {

    for (let weather of data) {
      let day = new Date(weather.day).getDay();
      console.log(day);
      this.locations[selectedLocation].weatherOfDay.push({
        id: weather.id,
        order: this.weatherId++,
        dayCount: this.locations[selectedLocation].weatherOfDay.length,
        day: this.day(day),
        temperature: weather.temperature,
        rain: weather.rain,
        wind: weather.wind,
      });
    }
  }

  private async SaveLocations() {
    let locationsData = [];
    for (let location of this.locations) {
      if (!location.id) {
        locationsData.push({
          Id: location.id,
          Name: location.name.trim(),
        });
      }
    }
    
    await fetch(this.locationUri, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locationsData)
    })
      .then(response => response.json())
      .then(data => this.HandleSaveLocations(data))
      .catch(error => console.error('Unable to save locations.', error));
      
  }

  private HandleSaveLocations(data: LocationDTO[]) {
    // Output data has the same order as input (this.locations)
    let locationsCount = this.locations.length;
    let x, y = 0;
    for (x = 0; x < locationsCount; x++) {
      if (!this.locations[x].id) this.locations[x].id = data[y++].id;
    }
  }

  private async SaveWeathers() {

    let weatherData = [];
    console.log(this.locations);
    let date: Date;
    for (let location of this.locations) {
      date = new Date();
      for (let weather of location.weatherOfDay) {
        weatherData.push({
          Id: weather.id,
          Temperature: weather.temperature,
          Rain: weather.rain,
          Wind: weather.wind,
          Day: date.toISOString(),
          LocationId: location.id
        });
        // Add days to the date.
        date.setDate(date.getDate() + 1);

      }
    }
    console.log(weatherData);
    
    fetch(this.weatherUri, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(weatherData)
    })
      .then(response => response.json())
      .then(data => this.handleSaveWeathers(data))
      .catch(error => console.error('Unable to save weathers.', error));
      
  }

  handleSaveWeathers(data: WeatherDTO[]) {
    // Set the ids
    let x = 0, y = 0, z = 0;
    for (x = 0; x < this.locations.length; x++) {
      let w = this.locations[x].weatherOfDay.length;
      for (y = 0; y < w; y++) {
        if (!this.locations[x].weatherOfDay[y].id) {
          this.locations[x].weatherOfDay[y].id = data[z++].id;
        }
      }
    }
  }

  public DeleteAction() {

    fetch(this.locationUri, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.deletable)
    })
      .then(response => response.json())
      .then(data => this.HandleDeletion(data))
      .catch(error => console.error('Unable to delete.', error));
      
  }

  HandleDeletion(data: { Id: number }[]) {
    this.deletable = [];
  }

}

interface Locations {
  id: number;
  order: number;
  name: string;
  weatherOfDay?: Weather[]
}

interface Weather {
  id: number;
  order: number;
  dayCount: number;
  day: string;
  temperature: number;
  rain: number;
  wind: number;
}

interface WeatherDTO {
  id: number;
  temperature: number;
  rain: number;
  wind: number;
  day: Date;
  locationId: number;
}

interface LocationDTO {
  id: number;
  name: string;
}
