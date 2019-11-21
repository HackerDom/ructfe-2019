using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Mime;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace HouseholdTests.Infrastructure
{
    public class TestApiClient
    {
        public static implicit operator HttpClient(TestApiClient client)
        {
            return client.innerClient;
        }

        private readonly HttpClient innerClient;

        public TestApiClient(HttpClient innerClient)
        {
            this.innerClient = innerClient;
            innerClient.Timeout = Timeout.InfiniteTimeSpan;
        }

        public async Task<ApiResult<T>> Get<T>(string uri) where T : class
        {
            var response = await innerClient.GetAsync(uri);
            var apiResult = await HandleResponse<T>(response);
            return apiResult;
        }

        public async Task<ApiResult<T>> Post<T>(string uri, T content) where T : class
        {
            var requestContent = JsonConvert.SerializeObject(content);
            var request = new StringContent(requestContent, Encoding.UTF8, MediaTypeNames.Application.Json);

            var response = await innerClient.PostAsync(uri, request);
            var apiResult = await HandleResponse<T>(response);
            return apiResult;
        }

        public async Task<ApiResult<string>> Post(string uri, KeyValuePair<string, string>[] formContent)
        {
            var request = new FormUrlEncodedContent(formContent);

            var response = await innerClient.PostAsync(uri, request);
            var apiResult = await HandleResponse<string>(response);
            return apiResult;
        }

        private async Task<ApiResult<T>> HandleResponse<T>(HttpResponseMessage response) where T : class
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
                    if (typeof(T) == "".GetType())
                    {
                        return new ApiResult<T>(response, stringContent as T);
                    }

                    return new ApiResult<T>(response, message: stringContent);
                }
            }

            var apiResult = new ApiResult<T>(response, value);
            return apiResult;
        }
    }
}
