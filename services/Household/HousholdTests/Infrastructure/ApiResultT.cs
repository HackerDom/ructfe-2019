using System;
using System.Net;
using System.Net.Http;
using FluentAssertions;
using HouseholdTests.Utils;

namespace HouseholdTests.Infrastructure
{
    public class ApiResult<T>
    {
        public HttpStatusCode StatusCode => response.StatusCode;
        public string Message { get; }
        public T Value { get; }

        private readonly HttpResponseMessage response;

        public ApiResult(HttpResponseMessage response, T value = default, string message = null)
        {
            this.response = response;
            Value = value;
            Message = message ?? response.ReasonPhrase;
        }

        public void EnsureStatusCode(HttpStatusCode code)
        {
            try
            {
                StatusCode.Should().Be(code);
            }
            catch (Exception e)
            {
                e.ChangeMessage(e.Message.Substring(0, e.Message.Length - 1) +
                                $" and received message '{Message}'.");
                throw;
            }
        }
    }
}
