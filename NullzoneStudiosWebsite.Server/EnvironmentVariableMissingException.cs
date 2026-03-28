
namespace NullzoneStudiosWebsite.Server
{
    [Serializable]
    internal class EnvironmentVariableMissingException : Exception
    {
        public EnvironmentVariableMissingException()
        {
        }

        public EnvironmentVariableMissingException(string? message) : base(message)
        {
        }

        public EnvironmentVariableMissingException(string? message, Exception? innerException) : base(message, innerException)
        {
        }
    }
}