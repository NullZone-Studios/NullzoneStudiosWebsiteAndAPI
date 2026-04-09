using HtmlAgilityPack;

namespace NullzoneStudiosWebsite.Server.Tools
{
    public static class HtmlBodyParser
    {
        public static string Parse(string? html)
        {
            if (string.IsNullOrWhiteSpace(html))
                return "(no preview)";

            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            foreach (var node in doc.DocumentNode
                .SelectNodes("//script|//style|//head") ?? Enumerable.Empty<HtmlNode>())
                node.Remove();

            var result = new System.Text.StringBuilder();
            Walk(doc.DocumentNode, result);

            return CleanWhitespace(result.ToString());
        }

        private static void Walk(HtmlNode node, System.Text.StringBuilder sb)
        {
            foreach (var child in node.ChildNodes)
            {
                if (child.NodeType == HtmlNodeType.Text)
                {
                    var text = HtmlEntity.DeEntitize(child.InnerText);
                    if (!string.IsNullOrWhiteSpace(text))
                        sb.Append(text);
                    continue;
                }

                if (child.NodeType != HtmlNodeType.Element)
                    continue;

                switch (child.Name.ToLower())
                {
                    case "img":
                        var alt = child.GetAttributeValue("alt", "")
                               ?? child.GetAttributeValue("src", "image").Split('/').Last();
                        sb.Append($"[img: {(string.IsNullOrWhiteSpace(alt) ? "image" : alt)}]");
                        break;

                    case "a":
                        var text = child.InnerText.Trim();
                        var href = child.GetAttributeValue("href", "");
                        sb.Append(!string.IsNullOrEmpty(text)
                            ? $"[{text}]({href})"
                            : href);
                        break;

                    case "br":
                        sb.Append('\n');
                        break;

                    case "p":
                    case "div":
                    case "tr":
                    case "li":
                        Walk(child, sb);
                        sb.Append('\n');
                        break;

                    default:
                        Walk(child, sb);
                        break;
                }
            }
        }

        private static string CleanWhitespace(string input) =>
            System.Text.RegularExpressions.Regex.Replace(input.Trim(), @"\n{3,}", "\n\n");
    }
}
