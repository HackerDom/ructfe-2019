using System;
using System.Net.Http;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace HouseholdTests.Infrastructure
{
    public class TestApiClient
    {
        private readonly HttpClient innerClient;

        public TestApiClient(HttpClient innerClient)
        {
            this.innerClient = innerClient;
        }

        public async Task<ApiResult<T>> Get<T>(string uri)
        {
            var response = await innerClient.GetAsync(uri);
            var apiResult = await HandleResponse<T>(response);
            return apiResult;
        }

        public async Task<ApiResult<T>> Post<T>(string uri, T content)
        {
            var requestContent = JsonConvert.SerializeObject(content);
            var request = new StringContent(requestContent, Encoding.UTF8, MediaTypeNames.Application.Json);

            var response = await innerClient.PostAsync(uri, request);
            var apiResult = await HandleResponse<T>(response);
            return apiResult;
        }

        private async Task<ApiResult<T>> HandleResponse<T>(HttpResponseMessage response)
        {
            T value = default;
            if (response.Content != null)
            {
                var stringContent = await response.Content.ReadAsStringAsync();
                try
                {
                    value = JsonConvert.DeserializeObject<T>(stringContent);
                }
                catch (JsonSerializationException e)
                {
                    Console.WriteLine($"Failed to deserialize service response as type '{nameof(T)}': '{stringContent}'");
                    Console.WriteLine(e);
                    throw;
                }
            }

            var apiResult = new ApiResult<T>(response.StatusCode, response.ReasonPhrase, value);
            return apiResult;
        }
    }
}
