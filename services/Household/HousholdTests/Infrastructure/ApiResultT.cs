using System;
using System.Linq;
using System.Net;
using System.Reflection;
using FluentAssertions;

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

        public void EnsureStatusCode(HttpStatusCode created)
        {
            try
            {
                StatusCode.Should().Be(created);
            }
            catch (Exception e)
            {
                var type = e.GetType();
                var field = type.GetFields(
                    BindingFlags.NonPublic |
                    BindingFlags.Instance).First();

                field?.SetValue(e,
                    e.Message.Substring(0, e.Message.Length - 1) +
                    $" and received message '{Message}'.");
                throw;
            }
        }
    }
}
