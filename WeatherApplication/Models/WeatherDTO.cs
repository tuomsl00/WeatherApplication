using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WeatherApplication.Models
{
    public class WeatherDTO
    {
        public long Id { get; set; }
        public short Temperature { get; set; }
        public short Rain { get; set; }
        public short Wind { get; set; }
        public DateTime Day { get; set; }
        public long LocationId { get; set; }
    }
}
