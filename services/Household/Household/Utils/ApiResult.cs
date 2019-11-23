using System.Net;

namespace Household.Utils
{
    public class ApiResult
    {
        private ApiResult(bool isSuccess, string message)
        {
            IsSuccess = isSuccess;
            Message = message;
        }

        public static ApiResult Success()
        {
            return new ApiResult(true, null);
        }

        public static ApiResult Failure(string message)
        {
            return new ApiResult(false, message);
        }

        public bool IsSuccess { get; }
        public bool IsFail => !IsSuccess;

        public string Message { get; }
    }

    public class ApiResult<T>
    {
        private ApiResult(bool isSuccess, string message, T value, HttpStatusCode statusCode)
        {
            IsSuccess = isSuccess;
            StatusCode = statusCode;
            Message = message;
            Value = value;
        }

        public static ApiResult<T> Success(T value)
        {
            return new ApiResult<T>(true, null, value, HttpStatusCode.OK);
        }

        public static ApiResult<T> Failure(string message, HttpStatusCode statusCode)
        {
            return new ApiResult<T>(false, message, default, statusCode);
        }

        public bool IsSuccess { get; }
        public bool IsFail => !IsSuccess;

        public HttpStatusCode StatusCode { get; }
        public string Message { get; }
        public T Value { get; }
    }
}
