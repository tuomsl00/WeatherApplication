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
    this.AddLocation("Turku");
    this.AddLocation("Tampere");
    this.AddLocation("Helsinki");
    this.AddLocation("Oulu");
  }

  public weather = [];
  public weatherId = 0;
  public selectedLocations = [];
  public rain = 100;
  public locations: Locations[] = [];

  public locationId:number;
  public dayCount: number;

  private lastWdayId = 0;
  private locationName = "";

  public AddWeatherInfo(temp: HTMLInputElement, rain: HTMLInputElement, wind: HTMLInputElement) {
    
    for (let i = 0; i < this.selectedLocations.length; i++) {

      if (!Array.isArray(this.locations[this.selectedLocations[i]].weatherOfDay)) {
        this.locations[this.selectedLocations[i]].weatherOfDay = [];
      }
      let day = new Date();
      let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      this.locations[this.selectedLocations[i]].weatherOfDay.push({
        id: this.weatherId++,
        dayCount: this.locations[this.selectedLocations[i]].weatherOfDay.length,
        day: days[(day.getDay() + this.locations[this.selectedLocations[i]].weatherOfDay.length-1) % 7],
        temperature: parseInt(temp.value),
        rain: parseInt(rain.value),
        wind: parseInt(wind.value)
      });
    }
  }

  public SaveWeatherInfo(temp: HTMLInputElement, rain: HTMLInputElement, wind: HTMLInputElement) {
    this.locations[this.locationId].weatherOfDay[this.dayCount].temperature = parseInt(temp.value);
    this.locations[this.locationId].weatherOfDay[this.dayCount].rain = parseInt(rain.value);
    this.locations[this.locationId].weatherOfDay[this.dayCount].wind = parseInt(wind.value);
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

  public SetLocationName() {
    this.locationName = (<HTMLInputElement>document.getElementById("location")).value;
  }

  public AddLocation(location: string | null) {

    let locationName = this.locationName.length ? this.locationName : location;
    //  location.hasOwnProperty('value') ? location.value : location.toString();
    this.locations.push({
      id: this.locations.length,
      name: locationName,
      weatherOfDay: []
    });
  }

  public DeleteLocation() {
    let i = 0;
    // Set initial values to all selected.
    for (i = 0; i < this.selectedLocations.length; i++) {
      this.locations.splice(this.selectedLocations[i], 1, { id: 0, name: "" });
    }
    // Pick all locations that has NOT initial values.
    this.locations = this.locations.filter((value) => {
      return value.name.length;
    })
    // Recount the ids. Id is for keeping thing in order
    for (i = 0; i < this.locations.length; i++) this.locations[i].id = i;

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

}

interface Locations {
  id: number;
  name: string;
  weatherOfDay?: Weather[]
}

interface Weather {
  id: number;
  dayCount: number;
  day: string;
  temperature: number;
  rain: number;
  wind: number;
}
