using Household.DataBase;
using Microsoft.AspNetCore.Mvc;
using Household.DataBaseModels;
using Microsoft.AspNetCore.Authorization;

namespace Household.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserRoleController : HouseholdControllerBase
    {
        public UserRoleController(HouseholdDbContext dataBase) : base(dataBase)
        {
        }

        [HttpGet]
        public ActionResult<string> GetRole()
        {
            return CurrentUser.Role.ToString();
        }
    }
}
