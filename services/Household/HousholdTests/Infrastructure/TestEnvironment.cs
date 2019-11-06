using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Household;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace HouseholdTests.Infrastructure
{
    public class TestUser
    {
        public string Login { get; set; }
        public string Password { get; set; }

        public TestApiClient Client { get; set; }
    }

    public class TestEnvironment
    {
        private readonly TestWebApplicationFactory factory;
        public TestApiClient Client { get; }

        public TestEnvironment()
        {
            factory = new TestWebApplicationFactory();
            Client = new TestApiClient(factory.CreateDefaultClient());
        }

        public async Task<TestUser> RegisterNewUser()
        {
            var login = $"{Guid.NewGuid()}@mail.ru";
            var password = "testPassword1!";
            //var userClient = new TestApiClient(factory.CreateClient(new WebApplicationFactoryClientOptions() {HandleCookies = true, AllowAutoRedirect = false}));
            var userClient = new TestApiClient(factory.CreateDefaultClient());

            var registrationForm = new[]
            {
                new KeyValuePair<string, string>("Input.Email", login),
                new KeyValuePair<string, string>("Input.Password", password),
                new KeyValuePair<string, string>("Input.ConfirmPassword", password)
            };

            var registerResult = await userClient
                .Post("/Identity/Account/Register", registrationForm)
                .ConfigureAwait(false);
            registerResult.EnsureStatusCode(HttpStatusCode.Found);

            return new TestUser {Login = login, Password = password, Client = userClient};
        }
    }


    internal class TestWebApplicationFactory : WebApplicationFactory<Startup>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder = Program.CreateWebHostBuilder(null);
            base.ConfigureWebHost(builder);
        }
    }
}
