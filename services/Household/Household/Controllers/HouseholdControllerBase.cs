using System;
using System.Linq;
using System.Net;
using Household.DataBase;
using Household.DataBaseModels;
using Household.Utils;
using Microsoft.AspNetCore.Mvc;

namespace Household.Controllers
{
    public abstract class HouseholdControllerBase : ControllerBase
    {
        private readonly HouseholdDbContext dataBase;

        protected HouseholdControllerBase(HouseholdDbContext dataBase)
        {
            this.dataBase = dataBase;
        }

        protected ObjectResult ResponseFromApiResult<T>(ApiResult<T> apiResult)
        {
            switch (apiResult.StatusCode)
            {
                case HttpStatusCode.OK:
                    return Ok(apiResult.Value);
                case HttpStatusCode.BadRequest:
                    return BadRequest(apiResult.Message);
                case HttpStatusCode.NotFound:
                    return NotFound(apiResult.Message);
                case HttpStatusCode.InternalServerError:
                    throw new Exception(apiResult.Message);
            }

            throw new Exception(apiResult.Message);
        }

        private ApplicationUser currentUser;

        protected ApplicationUser CurrentUser => currentUser ??= GetUser();

        private ApplicationUser GetUser()
        {
            var userId = User.Claims.ToArray()[5].Value;
            var user = dataBase.Users.Find(userId);
            return user;
        }
    }
}
