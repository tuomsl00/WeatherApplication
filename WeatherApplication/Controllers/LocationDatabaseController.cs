using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeatherApplication.Models;

namespace WeatherApplication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationDatabaseController : ControllerBase
    {
        private readonly AppDbContext _appDbContext;

        public LocationDatabaseController(AppDbContext appDbContext)
        {
            _appDbContext = appDbContext;
        }

        [HttpPost]
        public async Task<ActionResult> PostLocation(LocationDTO[] locationItem)
        {
            _appDbContext.Locations.UpdateRange(locationItem);
            await _appDbContext.SaveChangesAsync();

            return CreatedAtAction("GetLocationItem", locationItem);

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationDTO>>> GetLocations()
        {
            return await _appDbContext.Locations.Select(x => new LocationDTO()
            {
                Id = x.Id,
                Name = x.Name
            }).ToListAsync();
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteLocations(List<LocationDTO> locationItem)
        {
            // Remove locations
            var locations = _appDbContext.Locations;
            locationItem = locationItem.Where(x => locations.Any(y => y.Id == x.Id)).ToList();

            locations.RemoveRange(locationItem);

            // Remove all weathers releated to the locations.
            var weathers = _appDbContext.WeatherInfo;
            var weatherItem = weathers.ToList().Where(x => locationItem.Any(y => x.LocationId == y.Id));

            weathers.RemoveRange(weatherItem);

            await _appDbContext.SaveChangesAsync();

            return Accepted(weatherItem);
        }

    }
}