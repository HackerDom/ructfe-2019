using System;
using System.Net;
using FluentAssertions;
using HouseholdTests.Utils;

namespace HouseholdTests.Infrastructure
{
    public class ApiResult<T>
    {
        public HttpStatusCode StatusCode { get; }

        public string Message { get; }
        public T Value { get; }

        public ApiResult(HttpStatusCode statusCode, string message, T value = default)
        {
            StatusCode = statusCode;
            Message = message;
            Value = value;
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
