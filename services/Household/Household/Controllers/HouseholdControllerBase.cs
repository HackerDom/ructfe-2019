using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Household.DataBase;
using Household.DataBaseModels;
using Household.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Net.Http.Headers;

namespace Household.Controllers
{
    public abstract class HouseholdControllerBase : ControllerBase
    {
        private readonly HouseholdDbContext dataBase;

        protected HouseholdControllerBase(HouseholdDbContext dataBase)
        {
            this.dataBase = dataBase;
        }

        protected ObjectResult NotAllowed()
        {
            return BadRequest($"User '{CurrentUser.Id}' with role '{CurrentUser.Role}' is not allowed to action");
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

        protected async Task<ApiResult<(Stream FileContent, string FileName)>> LoadFile()
        {
            if (!MultipartRequestHelper.IsMultipartContentType(Request.ContentType))
            {
                return ApiResult<(Stream FileContent, string FileName)>.Failure(
                    $"The request couldn't be processed because of ContentType: {Request.ContentType}",
                    HttpStatusCode.BadRequest);
            }

            var boundary = MultipartRequestHelper.GetBoundary(MediaTypeHeaderValue.Parse(Request.ContentType));
            var reader = new MultipartReader(boundary, Request.Body);
            var section = await reader.ReadNextSectionAsync();

            var hasContentDispositionHeader = ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var contentDisposition);
            if (!hasContentDispositionHeader)
            {
                return ApiResult<(Stream FileContent, string FileName)>.Failure(
                    "The request couldn't be processed because of absent ContentDisposition",
                    HttpStatusCode.BadRequest);
            }

            // This check assumes that there's a file present without form data.
            // If form data is present, this method immediately fails and returns the model error.
            if (!MultipartRequestHelper.HasFileContentDisposition(contentDisposition))
            {
                return ApiResult<(Stream FileContent, string FileName)>.Failure(
                    $"The request couldn't be processed because of ContentDisposition {contentDisposition}",
                    HttpStatusCode.BadRequest);
            }

            var streamedFileContent = section.Body;
            if (!ModelState.IsValid)
                return ApiResult<(Stream FileContent, string FileName)>.Failure("", HttpStatusCode.BadRequest);

            return ApiResult<(Stream FileContent, string FileName)>
                .Success((streamedFileContent, contentDisposition.FileName.Value));
        }
    }
}
