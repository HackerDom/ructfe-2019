using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using HouseholdTests.Utils;
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

        public async Task<ApiResult<string>> Post(string uri, KeyValuePair<string,string>[] formContent)
        {
            var request = new FormUrlEncodedContent(formContent);

            var response = await innerClient.PostAsync(uri, request);
            var apiResult = await HandleResponse<string>(response);
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
                catch (Exception e) when (e is JsonReaderException || e is JsonSerializationException)
                {
                    e.ChangeMessage($"Failed to deserialize service response as type '{typeof(T)}': '{stringContent}'.\n"
                                    + e.Message);
                    throw;
                }
            }

            var apiResult = new ApiResult<T>(response.StatusCode, response.ReasonPhrase, value);
            return apiResult;
        }
    }
}
