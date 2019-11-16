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
        private ApiResult(bool isSuccess, string message, T value)
        {
            IsSuccess = isSuccess;
            Message = message;
            Value = value;
        }

        public static ApiResult<T> Success(T value)
        {
            return new ApiResult<T>(true, null, value);
        }

        public static ApiResult<T> Failure(string message)
        {
            return new ApiResult<T>(false, message, default);
        }

        public bool IsSuccess { get; }
        public bool IsFail => !IsSuccess;

        public string Message { get; }
        public T Value { get; }
    }
}
