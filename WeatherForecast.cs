using System;

namespace WeatherApplication
{
    public class WeatherForecast
    {
        public long Id { get; set; }
        public DateTime Date { get; set; }

        public int TemperatureC { get; set; }

        public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

        public int Rain { get; set; }
        public int Wind { get; set; }

        public int LocationId { get; set; }

        public string Summary { get; set; }
    }
}