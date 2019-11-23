using System;
using Household.Utils;
using Microsoft.EntityFrameworkCore;

namespace Household.DataBase
{
    public enum DatabaseSystem
    {
        MSSQL,
        PostgreSQL
    }

    public class DatabaseSystemFeatures
    {
        public static void DefineSqlServer(DbContextOptionsBuilder options, HouseholdConfiguration configuration)
        {
            if (!Enum.TryParse<DatabaseSystem>(configuration.DataBaseSystem, out var databaseSystem))
                return;

            switch (databaseSystem)
            {
                case DatabaseSystem.MSSQL:
                    //options.UseSqlServer(configuration.ConnectionString);
                    break;
                case DatabaseSystem.PostgreSQL:
                    options.UseNpgsql(configuration.ConnectionString);
                    break;
            }
        }

        public static string SqlGetDate(HouseholdConfiguration configuration)
        {
            if (!Enum.TryParse<DatabaseSystem>(configuration.DataBaseSystem, out var databaseSystem))
                return null;

            return databaseSystem switch
            {
                DatabaseSystem.MSSQL => "getdate()",
                DatabaseSystem.PostgreSQL => "(now() at time zone 'utc')",
                _ => null
            };
        }
    }
}
