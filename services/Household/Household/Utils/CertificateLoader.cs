using System.Collections.Generic;
using System.IO;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;

namespace Household.Utils
{
    public static class CertificateLoader
    {
        public static RsaSecurityKey LoadRsaSecurityKey(string rsaKeyPath)
        {
            var data = File.ReadAllText(rsaKeyPath);
            var pemReader = new PemReader(new StringReader(data));

            var pemSections = new List<object>();
            while (true)
            {
                var pemObject = pemReader.ReadObject();
                if (pemObject != null)
                    pemSections.Add(pemObject);

                var len = pemReader.Reader.Peek();
                if (len == -1)
                    break;
            }

            var pair = (AsymmetricCipherKeyPair) pemSections[0];
            var privateParameter = (RsaPrivateCrtKeyParameters) pair.Private;
            var rsaParams = DotNetUtilities.ToRSAParameters(privateParameter);

            return new RsaSecurityKey(rsaParams);
        }
    }
}
