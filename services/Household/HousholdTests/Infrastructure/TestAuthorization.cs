using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using FluentAssertions;
using Household.DataBaseModels;
using Household.Utils;
using HouseholdTests.Utils;
using IdentityModel;
using IdentityModel.Client;
using IdentityServer4.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;

namespace HouseholdTests.Infrastructure
{
    internal class TestAuthorization
    {
        private readonly TestWebApplicationFactory factory;
        private string Host => factory.ClientOptions.BaseAddress.AbsoluteUri;

        public TestAuthorization(TestWebApplicationFactory factory)
        {
            this.factory = factory;
        }

        public async Task Register(TestUser user, Role role = Role.Cook)
        {
            var client = new TestApiClient(factory.CreateClient(
                new WebApplicationFactoryClientOptions
                {
                    HandleCookies = true,
                    AllowAutoRedirect = false
                }));

            var registrationFormData = new[]
            {
                new KeyValuePair<string, string>("Input.Email", user.Login),
                new KeyValuePair<string, string>("Input.Password", user.Password),
                new KeyValuePair<string, string>("Input.Role", role.ToString())
            };

            // Регистрация - ставятся куки "idsrv.session" и ".AspNetCore.Identity.Application"
            var registerResult = await client.Post("/Identity/Account/Register", registrationFormData);
            registerResult.EnsureStatusCode(HttpStatusCode.Found);

            user.Client = client;
        }

        public async Task Login(TestUser user)
        {
            var loginFormData = new[]
            {
                new KeyValuePair<string, string>("Input.Email", user.Login),
                new KeyValuePair<string, string>("Input.Password", user.Password)
            };

            // Cтавится аутентификационная кука ... вроде те же самые "idsrv.session" и ".AspNetCore.Identity.Application"
            var loginResult = await user.Client.Post("/Identity/Account/Login", loginFormData);
            loginResult.EnsureStatusCode(HttpStatusCode.Found);
        }

        public async Task RequireIdentityServerToken(HttpClient client)
        {
            IdentityModelEventSource.ShowPII = true;

            var (codeVerifier, codeChallenge) = GetCodesForPKCE();

            var authCodeResponse = await client.GetAsync(
                "/connect/authorize?" +
                "client_id=Household&" +
                "response_type=code&" +
                "scope=HouseholdAPI%20openid%20profile&" +
                "state=5d4f6d1dd37f4f019258ce969a09a43a&" +
                "response_mode=query&" +
                "prompt=none&" +
                $"redirect_uri={Host}authentication/login-callback&" +
                "code_challenge_method=S256&" +
                $"code_challenge={codeChallenge}");

            authCodeResponse.StatusCode.Should().Be(HttpStatusCode.Found);

            // IdentityService редиректит на заданный в настройках фронтовый обработчик
            // по адресу redirect_uri и добавляет код в query-параметр
            var location = authCodeResponse.Headers.Location;
            var queryParams = HttpUtility.ParseQueryString(location.Query);
            var code = queryParams.Get("code");

            var tokenRequest = new AuthorizationCodeTokenRequest
            {
                ClientId = "Household",
                ClientSecret = "angular_web_app_client_secret", // не проверяет
                Address = $"{Host}connect/token",
                RedirectUri = $"{Host}authentication/login-callback",
                Code = code,

                // optional PKCE parameter
                CodeVerifier = codeVerifier
            };

            var tokenResponse = await client.RequestAuthorizationCodeTokenAsync(tokenRequest);
            tokenResponse.HttpStatusCode.Should().Be(HttpStatusCode.OK);

            // Ставим в заголовок Authorization строку "Bearer {значение токена}"
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                OidcConstants.AuthenticationSchemes.AuthorizationHeaderBearer, tokenResponse.AccessToken);

            //ParseAndValidateTokenWithPublicKey(tokenResponse.AccessToken);
        }

        private static (string CodeVerifier, string CodeChallenge) GetCodesForPKCE()
        {
            var codeVerifier = Generator.GetRandomString(100);
            var codeVerifierBytes = Encoding.ASCII.GetBytes(codeVerifier);
            var hashedBytes = codeVerifierBytes.Sha256();
            var codeChallenge = Base64Url.Encode(hashedBytes);
            return (codeVerifier, codeChallenge);
        }

        private static void ParseAndValidateTokenWithPublicKey(string token)
        {
            var handler = new JwtSecurityTokenHandler();
            handler.ValidateToken(token, new TokenValidationParameters
            {
                IssuerSigningKey = new ECDsaSecurityKey(CertificateLoader.GetECDsaPublicKey()),
                ValidAudience = "HouseholdAPI",
                ValidIssuer = "http://localhost"
            }, out _);
        }
    }
}
