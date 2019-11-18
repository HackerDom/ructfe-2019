using System;
using System.IO;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using Microsoft.IdentityModel.Tokens;
using Security.Cryptography;
using Security.Cryptography.X509Certificates;

namespace Household.Utils
{
    public static class CertificateLoader
    {
        public static ECDsa GetECDsaPublicKey()
        {
            var cerPath = @".\keys.cer";
            var b = File.ReadAllBytes(cerPath);

            using (var cert = new X509Certificate2(b))
            {
                var key = cert.GetECDsaPublicKey();
                return key;
            }
        }

        public static ECDsaSecurityKey GetECDsaSecurityKey(string pfxPassword)
        {
            var createdDsa = CreateECDsaKey(); //создаем новый ключ
            return new ECDsaSecurityKey(createdDsa);
            //var pfxPath = @".\keys.pfx";
            //var cerPath = @".\keys.cer";
            //if (!File.Exists(pfxPath)) //если нет приватного ключа создаем ключ
            //{
            //    var createdDsa = CreateECDsaKey(); //создаем новый ключ
            //    ExportECDsaKey(createdDsa, pfxPath, pfxPassword, cerPath); // сохраняем в файловую систему
            //    createdDsa.Dispose();
            //}
        }

        //public static ECDsaSecurityKey GetECDsaSecurityKey(string pfxPassword)
        //{
        //    var pfxPath = @".\keys.pfx";
        //    var cerPath = @".\keys.cer";
        //    if (!File.Exists(pfxPath)) //если нет приватного ключа создаем ключ
        //    {
        //        var createdDsa = CreateECDKey(); //создаем новый ключ
        //        ExportECDKey(createdDsa, pfxPath, pfxPassword, cerPath); // сохраняем в файловую систему
        //        createdDsa.Dispose();
        //    }

        //    var dsa = ImportECDKey(pfxPath, pfxPassword);
        //    return new ECDsaSecurityKey(dsa);
        //}

        //private static ECDsaCng CreateECDKey(string KeyName = "Ключ шифрования", string keyAlias = "AdminKey")
        //{
        //    var keyCreationParameters = new CngKeyCreationParameters
        //    {
        //        ExportPolicy = CngExportPolicies.AllowExport,
        //        KeyUsage = CngKeyUsages.Signing,
        //        KeyCreationOptions = CngKeyCreationOptions.OverwriteExistingKey,
        //        UIPolicy = new CngUIPolicy(CngUIProtectionLevels.ProtectKey, KeyName, "Key for signing tokens", null, "Creation title!"),
        //    };
        //    var key = CngKey.Create(CngAlgorithm.ECDsaP521, keyAlias, keyCreationParameters);
        //    var dsa = new ECDsaCng(key)
        //    {
        //        HashAlgorithm = CngAlgorithm.Sha512
        //    };
        //    return dsa;
        //}

        public static ECDsa CreateECDsaKey()
        {
            var ecDsa = new ECDsaOpenSsl();
            ecDsa.GenerateKey(new ECCurve());
            return ecDsa;
        }

        public static void ExportECDsaKey(ECDsa ecDsa, string pfxPath, string cerPath)
        {
            var privateKey = ecDsa.ExportECPrivateKey();
            var publicKey = ecDsa.ExportSubjectPublicKeyInfo();

            File.WriteAllBytes(pfxPath, privateKey);
            File.WriteAllBytes(cerPath, publicKey);
        }

        private static void ExportECDKey(ECDsaCng dsa, string pfxPath, string pfxPassword, string cerPath)
        {
            var certCreationParameters = new X509CertificateCreationParameters(new X500DistinguishedName("CN=Example Name"))
            {
                StartTime = DateTime.Now,
                EndTime = DateTime.MaxValue,
                TakeOwnershipOfKey = true,
                SignatureAlgorithm = X509CertificateSignatureAlgorithm.ECDsaSha512
            };

            using (var cert = dsa.Key.CreateSelfSignedCertificate(certCreationParameters))
            {
                File.WriteAllBytes(pfxPath, cert.Export(X509ContentType.Pkcs12, pfxPassword));
                File.WriteAllBytes(cerPath, cert.Export(X509ContentType.Cert, pfxPassword));
            }
        }

        private static ECDsaCng ImportECDKey(string pfxPath, string pfxPassword)
        {
            using (var cert = new X509Certificate2(pfxPath, pfxPassword))
            {
                var key = cert.GetCngPrivateKey();
                return new ECDsaCng(key);
            }
        }
    }
}
