using System;
using System.Linq;
using System.Reflection;

namespace HouseholdTests.Utils
{
    public static class ExceptionExtensions
    {
        public static void ChangeMessage(this Exception e, string newMessage)
        {
            var type = e.GetType();
            var field = type.GetFields(BindingFlags.NonPublic | BindingFlags.Instance)
                .First(f => f.Name == "_message");

            field?.SetValue(e, newMessage);
        }
    }
}
