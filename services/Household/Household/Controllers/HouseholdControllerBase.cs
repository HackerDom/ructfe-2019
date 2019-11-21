using System;
using System.Linq;
using System.Net;
using Household.Utils;
using Microsoft.AspNetCore.Mvc;

namespace Household.Controllers
{
    public abstract class HouseholdControllerBase : ControllerBase
    {
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

        protected string GetUserId()
        {
            return User.Claims.ToArray()[5].Value;
        }
    }
}
