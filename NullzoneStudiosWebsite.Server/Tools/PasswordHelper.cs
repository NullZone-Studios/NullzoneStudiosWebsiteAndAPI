using Nullzone.Cryptography;
using System.Text;

namespace NullzoneStudiosWebsite.Server.Tools
{
    public static class PasswordHelper
    {
        public static string HashPassword(string password, out string salt)
        {
            salt = Convert.ToBase64String(Encryption.GenerateIV());
            string saltedPassword = $"{salt}{password}";
            return Convert.ToBase64String(Encryption.Hash256(Encoding.UTF8.GetBytes(saltedPassword)));
        }

        public static bool VerifyPassword(string password, string hashedPassword, string salt)
        {
            string saltedPassword = $"{salt}{password}";
            string hash = Convert.ToBase64String(Encryption.Hash256(Encoding.UTF8.GetBytes(saltedPassword)));
            return (hash == hashedPassword);
        }
    }
}
