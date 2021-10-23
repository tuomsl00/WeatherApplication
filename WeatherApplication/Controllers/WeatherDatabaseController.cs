using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherApplication.Models;

namespace WeatherApplication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherDatabaseController : ControllerBase
    {
        private readonly AppDbContext _appDbContext;

        public WeatherDatabaseController(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }
        
        [HttpPost]
        public async Task<ActionResult> PostWeather(WeatherDTO[] weatherItem)
        {

            _appDbContext.WeatherInfo.UpdateRange(weatherItem);
            await _appDbContext.SaveChangesAsync();

            return CreatedAtAction("GetWeatherItem", weatherItem);

        }
       
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WeatherDTO>>> Get()
        {
            var locations = _appDbContext.Locations;
           
            return await _appDbContext.WeatherInfo.Select(x => new WeatherDTO() {
                Id = x.Id,
                Temperature = x.Temperature,
                Rain = x.Rain,
                Wind = x.Wind,
                LocationId = x.LocationId
            }).Where(y => locations.Any(x => x.Id == y.LocationId)).OrderBy(x => x.LocationId).ToListAsync();
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<WeatherDTO>> Get(long id)
        {
            var item = await _appDbContext.WeatherInfo.FindAsync(id);
            return item;
        }

        [Route("location/{id}")]
        public async Task<ActionResult<IEnumerable<WeatherDTO>>> GetWeatherByLocations(long id)
        {
            return await _appDbContext.WeatherInfo.Where(x => x.LocationId == id && x.Day >= DateTime.Now.Date).ToListAsync();
        }


    }
}