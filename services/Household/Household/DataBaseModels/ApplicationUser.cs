using System;
using Microsoft.AspNetCore.Identity;

namespace Household.DataBaseModels
{
    public class ApplicationUser : IdentityUser
    {
        public DateTime RegistrationDate { get; set; }
        public Role Role { get; set; }
    }
}
