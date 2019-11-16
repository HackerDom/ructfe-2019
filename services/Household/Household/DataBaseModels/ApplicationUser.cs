using Microsoft.AspNetCore.Identity;

namespace Household.DataBaseModels
{
    public class ApplicationUser : IdentityUser
    {
        public Role Role { get; set; }
    }
}
