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

        public async Task<T> Get<T>(string uri)
        {
            var response = await innerClient.GetAsync(uri);

            var r = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(r);
        }

        public async Task<T> Post<T>(string uri, T content)
        {
            var c = JsonConvert.SerializeObject(content);

            var request = new StringContent(c, Encoding.UTF8, MediaTypeNames.Application.Json);
            var response = await innerClient.PostAsync(uri, request);

            var r = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(r);
        }
    }
}
